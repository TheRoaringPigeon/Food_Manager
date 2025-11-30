import re
import httpx
from typing import Any, Dict, List, Optional
from constants import FM_API
from models.Recipe import RecipeTypeEnum
import json

class FMApiClientAsync:
  """
  Async version of the FoodMapping API client.
  """

  def __init__(self, base_url: str = FM_API):
    self.base_url = base_url.rstrip("/")
    self.client = httpx.AsyncClient(timeout=20.0)

  def _time_to_minutes(self, value: Optional[str]) -> Optional[int]:
    if not value:
      return None
    value = value.lower()
    hours = re.search(r"(\d+)\s*(hour|hr|hrs)", value)
    minutes = re.search(r"(\d+)\s*(minute|min|mins)", value)
    total = 0
    if hours:
      total += int(hours.group(1)) * 60
    if minutes:
      total += int(minutes.group(1))
    return total or None

  def _listify(self, value: Any) -> List[str]:
    if not value:
      return []
    if isinstance(value, list):
      return [str(v).strip() for v in value]
    if isinstance(value, str):
      return [v.strip() for v in value.split(",") if v.strip()]
    return []

  def _find_recipe_type(self, categories: List[str]) -> RecipeTypeEnum:
    for c in categories:
      if c.upper() in RecipeTypeEnum.__members__:
        return RecipeTypeEnum(c.lower())
    return RecipeTypeEnum.OTHER

  async def fetch_recipe(self, url: str) -> Dict[str, Any]:
    resp = await self.client.get(f"{self.base_url}/extract", params={"url": url})
    resp.raise_for_status()
    return resp.json()

  def convert_to_recipe(self, data: Dict[str, Any]) -> Dict[str, Any]:
    name = data.get("name") or "Untitled Recipe"
    description = data.get("description")
    ingredients = self._listify(data.get("recipeIngredient"))
    instructions = self._listify(data.get("recipeInstructions"))
    tags = data.get("keywords")
    prep_time = self._time_to_minutes(data.get("prepTime"))
    cook_time = self._time_to_minutes(data.get("cookTime"))
    category_list = self._listify(data.get("recipeCategory"))
    recipe_type = self._find_recipe_type(category_list) if category_list else RecipeTypeEnum.OTHER

    return {
        "name": name,
        "description": description,
        "ingredients": ingredients,
        "instructions": instructions,
        "prep_time": prep_time,
        "cook_time": cook_time,
        "servings": 1,
        "recipe_type": recipe_type,
        "tags": tags,
        "image_url": None,
        "is_favorite": False,
    }

  async def create_recipe(self, recipe: dict) -> Dict[str, Any]:
    url = f"{self.base_url}/food-manager/api/recipes"
    payload = self.convert_to_recipe(recipe)
    print(payload["recipe_type"])
    resp = await self.client.post(url, json=payload)
    resp.raise_for_status()
    return resp.json()

  async def close(self):
    await self.client.aclose()
