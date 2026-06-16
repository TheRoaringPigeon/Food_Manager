"""Adapter base for recipe sites that publish JSON-LD Recipe structured data."""
import json
from typing import Optional

import aiohttp
from bs4 import BeautifulSoup

from adapters.sitemap_base import SitemapSiteAdapter
from schemas.NormalizedRecipe import NormalizedRecipe
from utils.logger import get_logger
from utils.time import iso8601_to_minutes

logger = get_logger(__name__)


class JSONLDSiteAdapter(SitemapSiteAdapter):
    """Sitemap discovery + JSON-LD Recipe schema parsing."""

    async def fetch_and_parse(
        self, session: aiohttp.ClientSession, url: str
    ) -> Optional[NormalizedRecipe]:
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                response.raise_for_status()
                html = await response.text()
                return self._parse_html(html, url)
        except Exception as e:
            logger.error(f"[{self.site_id}] Error fetching {url}: [{type(e).__name__}] {e}")
            return None

    def _parse_html(self, html: str, url: str) -> Optional[NormalizedRecipe]:
        data = self._extract_json_ld(html, url)
        if not data:
            return None
        return self._map_to_normalized(url, data)

    def _extract_json_ld(self, html: str, url: str) -> Optional[dict]:
        soup = BeautifulSoup(html, "html.parser")
        json_ld_tag = soup.find("script", type="application/ld+json")

        if not json_ld_tag:
            logger.warning(f"[{self.site_id}] No JSON-LD found for {url}")
            return None

        try:
            raw = json.loads(json_ld_tag.string)

            if isinstance(raw, list):
                data = raw[0]
            elif isinstance(raw, dict) and "@graph" in raw:
                data = next(
                    (item for item in raw["@graph"] if item.get("@type") == "Recipe"),
                    None,
                )
                if not data:
                    logger.warning(f"[{self.site_id}] No Recipe found in @graph for {url}")
                    return None
            else:
                data = raw

            return data

        except Exception as e:
            logger.warning(f"[{self.site_id}] Failed to parse JSON-LD for {url}: {e}")
            return None

    def _map_to_normalized(self, url: str, data: dict) -> Optional[NormalizedRecipe]:
        name = data.get("name")
        if not name:
            logger.warning(f"[{self.site_id}] No recipe name in JSON-LD for {url}")
            return None

        instructions = []
        for step in data.get("recipeInstructions", []):
            if isinstance(step, dict):
                text = step.get("text") or step.get("name")
                if text:
                    instructions.append(text)
            elif isinstance(step, str):
                instructions.append(step)

        image = data.get("image")
        if isinstance(image, dict):
            image_url = image.get("url")
        elif isinstance(image, list) and image:
            first = image[0]
            image_url = first.get("url") if isinstance(first, dict) else str(first)
        elif isinstance(image, str):
            image_url = image
        else:
            image_url = None

        category_raw = data.get("recipeCategory") or []
        if isinstance(category_raw, str):
            category_raw = [category_raw]

        cuisine_raw = data.get("recipeCuisine")
        if isinstance(cuisine_raw, list):
            cuisine_raw = ", ".join(cuisine_raw)

        return NormalizedRecipe(
            source_url=url,
            name=name,
            description=data.get("description"),
            image_url=image_url,
            prep_time_minutes=iso8601_to_minutes(data.get("prepTime")),
            cook_time_minutes=iso8601_to_minutes(data.get("cookTime")),
            ingredients_raw=data.get("recipeIngredient") or [],
            instructions=instructions,
            category=category_raw,
            cuisine=cuisine_raw,
            keywords=data.get("keywords"),
        )
