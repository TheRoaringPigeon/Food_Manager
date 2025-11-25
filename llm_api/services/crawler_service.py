from fastapi import FastAPI
from models.Crawler import CrawlStatus
from schemas.Crawler import StatusResponse
from datetime import datetime
import asyncio
import os
import re
import json
from xml.etree import ElementTree
from bs4 import BeautifulSoup
from typing import List
import aiohttp
import html
from database import AsyncSessionLocal
from sqlalchemy import select
from models.Crawler import CrawlLock
from utils.logger import get_logger
from utils.time import iso8601_to_text
from integrations.chromadb import get_collection
from integrations.fm_api import FMApiClientAsync

fm_api_client = FMApiClientAsync()
logger = get_logger(__name__)

# === SETTINGS ===
SITEMAP_URL = "https://www.simplyrecipes.com/sitemap_1.xml"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)
MAX_CONCURRENT = 100


class CrawlerService:

  def __init__(self, app: FastAPI):
    self.app = app

  async def start_crawl(self):
    """Start the crawl process"""
    # Check if already running
    if self.app.state.crawler.status == CrawlStatus.RUNNING:
      return {"message": "Crawl already in progress", "status": "running"}

    # Try to acquire lock
    if not await self.acquire_lock():
      return {"message": "Another crawl is already running", "status": "locked"}

    # Reset state
    self.app.state.crawler.status = CrawlStatus.RUNNING
    self.app.state.crawler.processed_urls = 0
    self.app.state.crawler.success_count = 0
    self.app.state.crawler.fail_count = 0
    self.app.state.crawler.start_time = datetime.now()
    self.app.state.crawler.end_time = None
    self.app.state.crawler.error_message = None

    # Start crawler in background
    asyncio.create_task(self.run_crawler())

    return {"message": "Crawl started successfully", "status": "running"}

  async def check_crawl_status(self):
    """Check the current status of the crawler"""
    duration = None
    if self.app.state.crawler.start_time:
      end = self.app.state.crawler.end_time or datetime.now()
      duration = (end - self.app.state.crawler.start_time).total_seconds()

    is_locked = await self.check_lock()

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

  # === UTILITY FUNCTIONS ===
  def build_document(self, recipe):
    return (
        f"{recipe['name']}\n\n"
        f"Ingredients:\n" + "\n".join(recipe['recipeIngredient']) + "\n\n"
        f"Instructions:\n" + "\n".join(recipe['recipeInstructions'])
    )

  def build_metadata(self, recipe):
    return {
        "name": recipe["name"],
        "category": ", ".join(recipe.get("recipeCategory", [])),
        "cuisine": ", ".join(recipe.get("recipeCuisine", [])),
        "keywords": recipe.get("keywords"),
        "prepTime": recipe.get("prepTime"),
        "cookTime": recipe.get("cookTime"),
        "numIngredients": len(recipe.get("recipeIngredient", [])),
    }

  def html_unescape_recursive(self, obj):
    if isinstance(obj, dict):
      return {k: self.html_unescape_recursive(v) for k, v in obj.items()}
    elif isinstance(obj, list):
      return [self.html_unescape_recursive(i) for i in obj]
    elif isinstance(obj, str):
      return html.unescape(obj)
    else:
      return obj

  async def get_recipe_urls_from_sitemap(self, sitemap_url: str) -> List[str]:
    """Fetch URLs from the sitemap that are under /recipes/."""
    try:
      async with aiohttp.ClientSession() as session:
        async with session.get(sitemap_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
          response.raise_for_status()
          content = await response.read()

      root = ElementTree.fromstring(content)
      namespace = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
      all_urls = [loc.text for loc in root.findall(".//ns:loc", namespace)]
      recipe_urls = [u for u in all_urls if "/recipes/" in u][:50]
      logger.info(f"Found {len(recipe_urls)} recipe URLs (out of {len(all_urls)} total).")
      return recipe_urls
    except Exception as e:
      logger.error(f"Error fetching sitemap: {e}")
      return []

  def parse_recipe(self, html: str, url: str) -> dict:
    """Extract recipe information from Simply Recipes JSON-LD."""
    soup = BeautifulSoup(html, "html.parser")
    json_ld_tag = soup.find("script", type="application/ld+json")
    if not json_ld_tag:
      logger.warning(f"No JSON-LD found for {url}")
      return {"url": url}
    try:
      data = json.loads(json_ld_tag.string)[0]
      instructions = []
      for step in data.get("recipeInstructions", []):
        if isinstance(step, dict):
          text = step.get("text") or step.get("name")
          if text:
            instructions.append(text)
        elif isinstance(step, str):
          instructions.append(step)
      return {
          "url": url,
          "name": data.get("name"),
          "prepTime": iso8601_to_text(data.get("prepTime")),
          "cookTime": iso8601_to_text(data.get("cookTime")),
          "recipeCategory": data.get("recipeCategory"),
          "keywords": data.get("keywords"),
          "recipeCuisine": data.get("recipeCuisine"),
          "recipeIngredient": data.get("recipeIngredient"),
          "recipeInstructions": instructions
      }
    except Exception as e:
      logger.warning(f"Failed to parse JSON-LD for {url}: {e}")
      return {"url": url, "error": str(e)}

  async def fetch_and_parse(self, session: aiohttp.ClientSession, url: str) -> dict:
    """Fetch a single recipe and parse it."""
    try:
      async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
        response.raise_for_status()
        html = await response.text()
        return self.parse_recipe(html, url)
    except Exception as e:
      logger.error(f"Error fetching {url}: {e}")
      return {"url": url, "error": str(e)}

  async def save_recipe(self, result: dict):
    collection = get_collection()
    recipe_data = self.html_unescape_recursive(result)

    text = self.build_document(recipe_data)
    metadata = self.build_metadata(recipe_data)

    response = await fm_api_client.create_recipe(recipe_data)
    collection.add(
        ids=[str(response.get("id"))],
        documents=[text],
        metadatas=[metadata],
    )

  async def acquire_lock(self) -> bool:
    """Try to acquire the crawl lock. Returns True if successful."""
    async with AsyncSessionLocal() as db:
      # Get or create the lock record
      result = await db.execute(select(CrawlLock).where(CrawlLock.id == 1))
      lock = result.scalar_one_or_none()

      if not lock:
        lock = CrawlLock(id=1, is_locked=False)
        db.add(lock)
        await db.commit()
        await db.refresh(lock)

      # Try to acquire lock
      if not lock.is_locked:
        lock.is_locked = True
        await db.commit()
        return True
      return False

  async def release_lock(self):
    """Release the crawl lock."""
    async with AsyncSessionLocal() as db:
      result = await db.execute(select(CrawlLock).where(CrawlLock.id == 1))
      lock = result.scalar_one_or_none()

      if lock:
        lock.is_locked = False
        await db.commit()

  async def check_lock(self) -> bool:
    """Check if the lock is currently held."""
    async with AsyncSessionLocal() as db:
      result = await db.execute(select(CrawlLock).where(CrawlLock.id == 1))
      lock = result.scalar_one_or_none()
      return lock.is_locked if lock else False

  async def process_url(self, session: aiohttp.ClientSession, url: str, semaphore: asyncio.Semaphore):
    """Process a single URL with concurrency control."""
    async with semaphore:
      result = await self.fetch_and_parse(session, url)

      # Update counters
      self.app.state.crawler.processed_urls += 1
      if "error" in result:
        self.app.state.crawler.fail_count += 1
      else:
        self.app.state.crawler.success_count += 1

      # Save the recipe
      await self.save_recipe(result)

      return result

  async def run_crawler(self):
    """Main function to run crawler in background."""
    try:
      # Get recipe URLs from sitemap
      recipe_urls = await self.get_recipe_urls_from_sitemap(SITEMAP_URL)

      if not recipe_urls:
        logger.warning("No recipe URLs found.")
        self.app.state.crawler.status = CrawlStatus.FAILED
        self.app.state.crawler.error_message = "No recipe URLs found"
        self.app.state.crawler.end_time = datetime.now()
        await self.release_lock()
        return

      self.app.state.crawler.total_urls = len(recipe_urls)
      logger.info(f"Starting crawl of {len(recipe_urls)} recipes...")

      # Create semaphore to limit concurrent requests
      semaphore = asyncio.Semaphore(MAX_CONCURRENT)

      # Create aiohttp session for all requests
      async with aiohttp.ClientSession() as session:
        # Create tasks for all URLs
        tasks = [
            self.process_url(session, url, semaphore)
            for url in recipe_urls
        ]

        # Process all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Handle any exceptions
        for i, result in enumerate(results):
          if isinstance(result, Exception):
            logger.error(f"Exception processing {recipe_urls[i]}: {result}")
            self.app.state.crawler.fail_count += 1

      # Mark as completed
      self.app.state.crawler.status = CrawlStatus.COMPLETED
      self.app.state.crawler.end_time = datetime.now()
      logger.info(f"Crawl complete. {self.app.state.crawler.processed_urls} recipes processed.")

    except Exception as e:
      logger.error(f"Crawler failed: {e}")
      self.app.state.crawler.status = CrawlStatus.FAILED
      self.app.state.crawler.error_message = str(e)
      self.app.state.crawler.end_time = datetime.now()

    finally:
      # Always release the lock
      await self.release_lock()
