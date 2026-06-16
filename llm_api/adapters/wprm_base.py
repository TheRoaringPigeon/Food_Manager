"""Adapter base for WordPress sites running the WP Recipe Maker (WPRM) plugin."""
from typing import Optional

import aiohttp
from bs4 import BeautifulSoup, Tag

from adapters.sitemap_base import SitemapSiteAdapter
from schemas.NormalizedRecipe import NormalizedRecipe
from utils.logger import get_logger

logger = get_logger(__name__)


def _wprm_time_minutes(recipe: Tag, time_type: str) -> Optional[int]:
    """Extract hours + minutes from WPRM time spans and return total minutes."""
    hours_tag = recipe.find(class_=f"wprm-recipe-{time_type}_time-hours")
    minutes_tag = recipe.find(class_=f"wprm-recipe-{time_type}_time-minutes")
    try:
        hours = int(hours_tag.get_text(strip=True)) if hours_tag else 0
        minutes = int(minutes_tag.get_text(strip=True)) if minutes_tag else 0
        total = hours * 60 + minutes
        return total if total > 0 else None
    except (ValueError, AttributeError):
        return None


class WPRMSiteAdapter(SitemapSiteAdapter):
    """
    Adapter base for WordPress recipe sites using WP Recipe Maker.

    WPRM renders its recipe card as server-side PHP, so all structured content
    is available in static HTML under stable wprm-recipe-* class names.
    Subclasses only need to provide site_id, sitemap_url, and url_filter.
    """

    async def fetch_and_parse(
        self, session: aiohttp.ClientSession, url: str
    ) -> Optional[NormalizedRecipe]:
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                response.raise_for_status()
                html = await response.text()
        except Exception as e:
            logger.error(f"[{self.site_id}] Error fetching {url}: [{type(e).__name__}] {e}")
            return None

        return self._parse_wprm(html, url)

    def _parse_wprm(self, html: str, url: str) -> Optional[NormalizedRecipe]:
        soup = BeautifulSoup(html, "html.parser")
        recipe = soup.find(class_="wprm-recipe-container")

        if not recipe:
            logger.warning(f"[{self.site_id}] No WPRM recipe block found at {url}")
            return None

        name_tag = recipe.find(class_="wprm-recipe-name")
        if not name_tag:
            logger.warning(f"[{self.site_id}] No recipe name at {url}")
            return None
        name = name_tag.get_text(strip=True)

        description_tag = recipe.find(class_="wprm-recipe-summary")
        description = description_tag.get_text(separator=" ", strip=True) if description_tag else None

        image_url = None
        image_container = recipe.find(class_="wprm-recipe-image")
        if image_container:
            img = image_container.find("img")
            if img:
                image_url = img.get("src") or img.get("data-src") or img.get("data-lazy-src")

        prep_minutes = _wprm_time_minutes(recipe, "prep")
        cook_minutes = _wprm_time_minutes(recipe, "cook")

        ingredients_raw = []
        for li in recipe.find_all(class_="wprm-recipe-ingredient"):
            parts = []
            for cls in [
                "wprm-recipe-ingredient-amount",
                "wprm-recipe-ingredient-unit",
                "wprm-recipe-ingredient-name",
            ]:
                tag = li.find(class_=cls)
                if tag:
                    text = tag.get_text(strip=True)
                    if text:
                        parts.append(text)
            if parts:
                ingredients_raw.append(" ".join(parts))

        instructions = []
        for li in recipe.find_all(class_="wprm-recipe-instruction"):
            text_div = li.find(class_="wprm-recipe-instruction-text")
            text = (text_div or li).get_text(separator=" ", strip=True)
            if text:
                instructions.append(text)

        category_tags = recipe.find_all(class_="wprm-recipe-course")
        categories = [t.get_text(strip=True) for t in category_tags if t.get_text(strip=True)]

        cuisine_tag = recipe.find(class_="wprm-recipe-cuisine")
        cuisine = cuisine_tag.get_text(strip=True) if cuisine_tag else None

        keyword_tags = recipe.find_all(class_="wprm-recipe-keyword")
        keywords = ", ".join(t.get_text(strip=True) for t in keyword_tags) or None

        return NormalizedRecipe(
            source_url=url,
            name=name,
            description=description,
            image_url=image_url,
            prep_time_minutes=prep_minutes,
            cook_time_minutes=cook_minutes,
            ingredients_raw=ingredients_raw,
            instructions=instructions,
            category=categories,
            cuisine=cuisine,
            keywords=keywords,
        )
