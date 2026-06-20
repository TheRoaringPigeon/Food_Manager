import aiohttp
from adapters.jsonld_base import JSONLDSiteAdapter
from adapters.sitemap_base import HTTP_HEADERS
from xml.etree import ElementTree
from constants import CRAWL_LIMIT
from utils.logger import get_logger

logger = get_logger(__name__)

_SITEMAPS = [
    "https://pinchofyum.com/post-sitemap.xml",
    "https://pinchofyum.com/post-sitemap2.xml",
]


class PinchOfYumSiteAdapter(JSONLDSiteAdapter):
    site_id = "pinchofyum"
    sitemap_url = _SITEMAPS[0]
    url_filter = "pinchofyum.com"

    async def get_recipe_urls(self) -> list[str]:
        seen: set[str] = set()
        urls: list[str] = []
        try:
            async with aiohttp.ClientSession(headers=HTTP_HEADERS) as session:
                for sitemap_url in _SITEMAPS:
                    async with session.get(sitemap_url, timeout=aiohttp.ClientTimeout(total=60)) as r:
                        r.raise_for_status()
                        content = await r.read()
                    root = ElementTree.fromstring(content)
                    ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
                    for loc in root.findall(".//ns:loc", ns):
                        u = loc.text
                        if u and self.url_filter in u and u not in seen:
                            seen.add(u)
                            urls.append(u)
        except Exception as e:
            logger.error(f"[{self.site_id}] Error fetching sitemaps: {e}")
            return []

        if CRAWL_LIMIT:
            urls = urls[:CRAWL_LIMIT]

        logger.info(f"[{self.site_id}] Found {len(urls)} recipe URLs across {len(_SITEMAPS)} sitemaps.")
        return urls
