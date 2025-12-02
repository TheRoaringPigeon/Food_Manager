"""Service for fetching and parsing sitemaps."""
from typing import List
from xml.etree import ElementTree
import aiohttp
from utils.logger import get_logger

logger = get_logger(__name__)


class SitemapService:
  """Handles fetching and parsing XML sitemaps."""

  @staticmethod
  async def get_recipe_urls_from_sitemap(sitemap_url: str, url_filter: str = "/recipes/", limit: int = None) -> List[str]:
    """
    Fetch URLs from the sitemap that match the given filter.

    Args:
        sitemap_url: The URL of the sitemap to fetch
        url_filter: String that must be present in URLs to include them
        limit: Maximum number of URLs to return (None for all)

    Returns:
        List of filtered URLs from the sitemap
    """
    try:
      async with aiohttp.ClientSession() as session:
        async with session.get(sitemap_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
          response.raise_for_status()
          content = await response.read()

      root = ElementTree.fromstring(content)
      namespace = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
      all_urls = [loc.text for loc in root.findall(".//ns:loc", namespace)]

      filtered_urls = [u for u in all_urls if url_filter in u][:20]

      if limit:
        filtered_urls = filtered_urls[:limit]

      logger.info(f"Found {len(filtered_urls)} recipe URLs (out of {len(all_urls)} total).")
      return filtered_urls

    except Exception as e:
      logger.error(f"Error fetching sitemap: {e}")
      return []
