"""Service for parsing recipe HTML and extracting structured data."""
import json
from bs4 import BeautifulSoup
import aiohttp
from utils.logger import get_logger
from utils.time import iso8601_to_text

logger = get_logger(__name__)


class RecipeParser:
  """Handles fetching and parsing recipe HTML pages."""

  @staticmethod
  def parse_recipe(html: str, url: str) -> dict:
    """
    Extract recipe information from Simply Recipes JSON-LD.

    Args:
        html: The HTML content of the recipe page
        url: The URL of the recipe (for logging)

    Returns:
        Dictionary containing parsed recipe data or error information
    """
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

  @staticmethod
  async def fetch_and_parse(session: aiohttp.ClientSession, url: str) -> dict:
    """
    Fetch a single recipe URL and parse it.

    Args:
        session: The aiohttp session to use for the request
        url: The URL to fetch

    Returns:
        Dictionary containing parsed recipe data or error information
    """
    try:
      async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
        response.raise_for_status()
        html = await response.text()
        return RecipeParser.parse_recipe(html, url)
    except Exception as e:
      logger.error(f"Error fetching {url}: {e}")
      return {"url": url, "error": str(e)}
