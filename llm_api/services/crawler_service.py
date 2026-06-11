"""Main crawler orchestration service."""
from fastapi import FastAPI
from models.Crawler import CrawlStatus
from schemas.Crawler import StatusResponse
from datetime import datetime
import asyncio
import os
import aiohttp
from typing import List
from database import AsyncSessionLocal
from sqlalchemy import select
from models.Crawler import CrawlLock
from utils.logger import get_logger
from services.sitemap_service import SitemapService
from services.recipe_parser import RecipeParser
from services.recipe_persistence import RecipePersistence

logger = get_logger(__name__)

# === SETTINGS ===
SITEMAP_URL = "https://www.budgetbytes.com/post-sitemap.xml"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)
MAX_CONCURRENT = 3


class CrawlerService:
  """Orchestrates the recipe crawling process."""

  def __init__(self, app: FastAPI):
    """
    Initialize the crawler service.

    Args:
        app: FastAPI application instance (for state management)
    """
    self.app = app
    self.persistence = RecipePersistence()

  async def start_crawl(self):
    """
    Start the crawl process.

    Returns:
        Dictionary with status message and current state
    """
    if self.app.state.crawler.status == CrawlStatus.RUNNING:
      return {"message": "Crawl already in progress", "status": "running"}

    if not await self._acquire_lock():
      return {"message": "Another crawl is already running", "status": "locked"}

    self._reset_crawler_state()

    asyncio.create_task(self._run_crawler())

    return {"message": "Crawl started successfully", "status": "running"}

  async def check_crawl_status(self):
    """
    Check the current status of the crawler.

    Returns:
        StatusResponse with current crawler state
    """
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
    """Reset crawler state to initial values."""
    self.app.state.crawler.status = CrawlStatus.RUNNING
    self.app.state.crawler.processed_urls = 0
    self.app.state.crawler.success_count = 0
    self.app.state.crawler.fail_count = 0
    self.app.state.crawler.start_time = datetime.now()
    self.app.state.crawler.end_time = None
    self.app.state.crawler.error_message = None

  async def _run_crawler(self):
    """Main function to run crawler in background."""
    try:
      all_recipe_urls = await SitemapService.get_recipe_urls_from_sitemap(
          SITEMAP_URL,
          url_filter="budgetbytes.com"
      )

      recipe_urls = await RecipePersistence.check_recipe_urls_against_db(all_recipe_urls)

      if not all_recipe_urls or not recipe_urls:
        msg = self._get_empty_results_message(all_recipe_urls, recipe_urls)
        logger.warning(msg)
        self._mark_crawler_idle(msg)
        await self._release_lock()
        return

      self.app.state.crawler.total_urls = len(recipe_urls)
      logger.info(f"Starting crawl of {len(recipe_urls)} recipes...")

      await self._process_all_urls(recipe_urls)

      self._mark_crawler_completed()
      logger.info(f"Crawl complete. {self.app.state.crawler.processed_urls} recipes processed.")

    except Exception as e:
      logger.error(f"Crawler failed: {e}")
      self._mark_crawler_failed(str(e))

    finally:
      await self._release_lock()

  async def _process_all_urls(self, recipe_urls: List[str]):
    """
    Process all recipe URLs concurrently.

    Args:
        recipe_urls: List of URLs to process
    """
    headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    }
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    async with aiohttp.ClientSession(headers=headers) as session:
      tasks = [
          self._process_url(session, url, semaphore)
          for url in recipe_urls
      ]

      results = await asyncio.gather(*tasks, return_exceptions=True)

      for i, result in enumerate(results):
        if isinstance(result, Exception):
          logger.error(
              f"Exception processing {recipe_urls[i]}: "
              f"[{type(result).__name__}] {result}",
              exc_info=result
          )
          self.app.state.crawler.fail_count += 1

  async def _process_url(self, session: aiohttp.ClientSession, url: str, semaphore: asyncio.Semaphore):
    """
    Process a single URL with concurrency control.

    Args:
        session: aiohttp session for requests
        url: URL to process
        semaphore: Semaphore for concurrency control

    Returns:
        Parsed recipe data or exception
    """
    async with semaphore:
      result = await RecipeParser.fetch_and_parse(session, url)

      self.app.state.crawler.processed_urls += 1
      if "error" in result:
        self.app.state.crawler.fail_count += 1
      else:
        self.app.state.crawler.success_count += 1

      await self.persistence.save_recipe(result)

      return result

  def _mark_crawler_idle(self, error_message: str):
    """Mark crawler as idle with an error message."""
    self.app.state.crawler.status = CrawlStatus.IDLE
    self.app.state.crawler.error_message = error_message
    self.app.state.crawler.end_time = datetime.now()

  def _mark_crawler_completed(self):
    """Mark crawler as completed successfully."""
    self.app.state.crawler.status = CrawlStatus.COMPLETED
    self.app.state.crawler.end_time = datetime.now()

  def _mark_crawler_failed(self, error_message: str):
    """Mark crawler as failed with an error message."""
    self.app.state.crawler.status = CrawlStatus.FAILED
    self.app.state.crawler.error_message = error_message
    self.app.state.crawler.end_time = datetime.now()

  @staticmethod
  def _get_empty_results_message(all_urls: List[str], filtered_urls: List[str]) -> str:
    """Generate appropriate error message for empty results."""
    if not all_urls:
      return f"No URLs found from sitemap [{SITEMAP_URL}]"
    else:
      return f"No new URLs found from sitemap [{SITEMAP_URL}]"

  async def _acquire_lock(self) -> bool:
    """
    Try to acquire the crawl lock.

    Returns:
        True if lock was successfully acquired, False otherwise
    """
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
    """Release the crawl lock."""
    async with AsyncSessionLocal() as db:
      result = await db.execute(select(CrawlLock).where(CrawlLock.id == 1))
      lock = result.scalar_one_or_none()

      if lock:
        lock.is_locked = False
        await db.commit()

  async def _check_lock(self) -> bool:
    """
    Check if the lock is currently held.

    Returns:
        True if lock is held, False otherwise
    """
    async with AsyncSessionLocal() as db:
      result = await db.execute(select(CrawlLock).where(CrawlLock.id == 1))
      lock = result.scalar_one_or_none()
      return lock.is_locked if lock else False
