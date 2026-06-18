"""Main crawler orchestration service."""
from fastapi import FastAPI
from models.Crawler import CrawlStatus
from schemas.Crawler import StatusResponse
from datetime import datetime
import asyncio
import aiohttp
from typing import List
from database import AsyncSessionLocal
from sqlalchemy import select
from models.Crawler import CrawlLock
from utils.logger import get_logger
from adapters.base import SiteRegistry, site_registry
from services.recipe_persistence import RecipePersistence

logger = get_logger(__name__)

_HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


class CrawlerService:
  """Orchestrates the recipe crawling process."""

  def __init__(self, app: FastAPI, registry: SiteRegistry = None):
    self.app = app
    self.registry = registry or site_registry
    self.persistence = RecipePersistence()

  async def start_crawl(self):
    if self.app.state.crawler.status == CrawlStatus.RUNNING:
      return {"message": "Crawl already in progress", "status": "running"}

    if not await self._acquire_lock():
      return {"message": "Another crawl is already running", "status": "locked"}

    self._reset_crawler_state()

    asyncio.create_task(self._run_crawler())

    return {"message": "Crawl started successfully", "status": "running"}

  async def check_crawl_status(self):
    duration = None
    if self.app.state.crawler.start_time:
      end = self.app.state.crawler.end_time or datetime.now()
      duration = (end - self.app.state.crawler.start_time).total_seconds()

    is_locked = await self._check_lock()

    return StatusResponse(
        status=self.app.state.crawler.status,
        start_time=self.app.state.crawler.start_time.isoformat() if self.app.state.crawler.start_time else None,
        end_time=self.app.state.crawler.end_time.isoformat() if self.app.state.crawler.end_time else None,
        total_urls=self.app.state.crawler.total_urls,
        processed_urls=self.app.state.crawler.processed_urls,
        success_count=self.app.state.crawler.success_count,
        fail_count=self.app.state.crawler.fail_count,
        error_message=self.app.state.crawler.error_message,
        duration_seconds=duration,
        is_locked=is_locked
    )

  def _reset_crawler_state(self):
    self.app.state.crawler.status = CrawlStatus.RUNNING
    self.app.state.crawler.processed_urls = 0
    self.app.state.crawler.success_count = 0
    self.app.state.crawler.fail_count = 0
    self.app.state.crawler.start_time = datetime.now()
    self.app.state.crawler.end_time = None
    self.app.state.crawler.error_message = None
    self.app.state.crawler.cancel_event.clear()

  async def stop_crawl(self):
    if self.app.state.crawler.status != CrawlStatus.RUNNING:
      return {"message": "No crawl is currently running", "status": self.app.state.crawler.status}

    self.app.state.crawler.cancel_event.set()
    return {"message": "Cancellation requested — crawler will stop after the current URL", "status": "cancelling"}

  async def _run_crawler(self):
    """Iterate registered adapters sequentially, crawling each site's recipes."""
    try:
      adapters = self.registry.get_all()
      if not adapters:
        msg = "No site adapters registered."
        logger.warning(msg)
        self._mark_crawler_idle(msg)
        await self._release_lock()
        return

      cancel_event = self.app.state.crawler.cancel_event

      async with aiohttp.ClientSession(headers=_HTTP_HEADERS) as session:
        for adapter in adapters:
          if cancel_event.is_set():
            logger.info("Crawl cancellation requested — stopping before next adapter.")
            break

          try:
            all_urls = await adapter.get_recipe_urls()
            new_urls = await RecipePersistence.check_recipe_urls_against_db(all_urls)
          except Exception as e:
            logger.error(f"[{adapter.site_id}] Failed to get URLs, skipping adapter: {e}")
            continue

          if not new_urls:
            logger.info(f"[{adapter.site_id}] No new URLs to crawl.")
            continue

          self.app.state.crawler.total_urls += len(new_urls)
          logger.info(f"[{adapter.site_id}] Crawling {len(new_urls)} new recipes...")

          for url in new_urls:
            if cancel_event.is_set():
              logger.info(f"[{adapter.site_id}] Crawl cancellation requested — stopping mid-batch.")
              break

            try:
              result = await adapter.fetch_and_parse(session, url)
              self.app.state.crawler.processed_urls += 1

              if result is None:
                self.app.state.crawler.fail_count += 1
                logger.warning(f"[{adapter.site_id}] Skipping {url}: parse returned None")
              else:
                await self.persistence.save_recipe(result)
                self.app.state.crawler.success_count += 1
            except Exception as e:
              self.app.state.crawler.fail_count += 1
              logger.error(f"[{adapter.site_id}] Failed to process {url}: [{type(e).__name__}] {e}")

      if cancel_event.is_set():
        self._mark_crawler_cancelled()
        logger.info(f"Crawl cancelled. {self.app.state.crawler.processed_urls} recipes processed before stop.")
      else:
        self._mark_crawler_completed()
        logger.info(f"Crawl complete. {self.app.state.crawler.processed_urls} recipes processed.")

    except Exception as e:
      logger.error(f"Crawler failed: {e}")
      self._mark_crawler_failed(str(e))

    finally:
      await self._release_lock()

  def _mark_crawler_cancelled(self):
    self.app.state.crawler.status = CrawlStatus.CANCELLED
    self.app.state.crawler.end_time = datetime.now()

  def _mark_crawler_idle(self, error_message: str):
    self.app.state.crawler.status = CrawlStatus.IDLE
    self.app.state.crawler.error_message = error_message
    self.app.state.crawler.end_time = datetime.now()

  def _mark_crawler_completed(self):
    self.app.state.crawler.status = CrawlStatus.COMPLETED
    self.app.state.crawler.end_time = datetime.now()

  def _mark_crawler_failed(self, error_message: str):
    self.app.state.crawler.status = CrawlStatus.FAILED
    self.app.state.crawler.error_message = error_message
    self.app.state.crawler.end_time = datetime.now()

  async def _acquire_lock(self) -> bool:
    async with AsyncSessionLocal() as db:
      result = await db.execute(select(CrawlLock).where(CrawlLock.id == 1))
      lock = result.scalar_one_or_none()

      if not lock:
        lock = CrawlLock(id=1, is_locked=False)
        db.add(lock)
        await db.commit()
        await db.refresh(lock)

      if not lock.is_locked:
        lock.is_locked = True
        await db.commit()
        return True
      return False

  async def _release_lock(self):
    async with AsyncSessionLocal() as db:
      result = await db.execute(select(CrawlLock).where(CrawlLock.id == 1))
      lock = result.scalar_one_or_none()

      if lock:
        lock.is_locked = False
        await db.commit()

  async def _check_lock(self) -> bool:
    async with AsyncSessionLocal() as db:
      result = await db.execute(select(CrawlLock).where(CrawlLock.id == 1))
      lock = result.scalar_one_or_none()
      return lock.is_locked if lock else False
