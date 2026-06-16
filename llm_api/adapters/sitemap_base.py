"""Base adapter for sites where recipe URLs are discovered via XML sitemap."""
from abc import abstractmethod
from xml.etree import ElementTree
import aiohttp
from adapters.base import SiteAdapter
from constants import CRAWL_LIMIT
from utils.logger import get_logger

logger = get_logger(__name__)

HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


class SitemapSiteAdapter(SiteAdapter):
    """Discovers recipe URLs from an XML sitemap. Subclasses provide fetch_and_parse."""

    @property
    @abstractmethod
    def sitemap_url(self) -> str: ...

    @property
    @abstractmethod
    def url_filter(self) -> str: ...

    async def get_recipe_urls(self) -> list[str]:
        try:
            async with aiohttp.ClientSession(headers=HTTP_HEADERS) as session:
                async with session.get(
                    self.sitemap_url, timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    response.raise_for_status()
                    content = await response.read()

            root = ElementTree.fromstring(content)
            namespace = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            all_urls = [loc.text for loc in root.findall(".//ns:loc", namespace)]

            filtered = [u for u in all_urls if self.url_filter in u]
            if CRAWL_LIMIT:
                filtered = filtered[:CRAWL_LIMIT]

            logger.info(f"[{self.site_id}] Found {len(filtered)} recipe URLs (of {len(all_urls)} total).")
            return filtered

        except Exception as e:
            logger.error(f"[{self.site_id}] Error fetching sitemap: {e}")
            return []
