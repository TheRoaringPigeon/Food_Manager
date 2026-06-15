import re
import httpx
from typing import Any, Dict, List, Optional
from constants import FM_API, FM_API_SERVICE_USERNAME, FM_API_SERVICE_PASSWORD
from models.Recipe import RecipeTypeEnum
import json

class FMApiClientAsync:
  """
  Async version of the FoodMapping API client.
  """

  def __init__(self, base_url: str = FM_API):
    self.base_url = base_url.rstrip("/")
    self.client = httpx.AsyncClient(timeout=20.0)
    self._token: Optional[str] = None

  async def _ensure_token(self) -> str:
    if self._token:
      return self._token
    resp = await self.client.post(
      f"{self.base_url}/food-manager/api/auth/login",
      json={"username": FM_API_SERVICE_USERNAME, "password": FM_API_SERVICE_PASSWORD},
    )
    resp.raise_for_status()
    self._token = resp.json()["access_token"]
    return self._token

  def _auth_header(self) -> dict:
    return {"Authorization": f"Bearer {self._token}"}

  def _time_to_minutes(self, value: Optional[str]) -> Optional[int]:
    if not value:
      return None
    # ISO 8601 duration: PT1H30M, PT30M, PT1H
    iso = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?', value, re.IGNORECASE)
    if iso and (iso.group(1) or iso.group(2)):
      return int(iso.group(1) or 0) * 60 + int(iso.group(2) or 0)
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
    image_url = data.get("image_url")
    raw = data.get("recipeIngredient") or []
    ingredients = [v if isinstance(v, dict) else str(v).strip() for v in (raw if isinstance(raw, list) else [])]
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
        "image_url": image_url,
    }

  async def create_recipe(self, recipe: dict) -> Dict[str, Any]:
    await self._ensure_token()
    url = f"{self.base_url}/food-manager/api/recipes"
    payload = self.convert_to_recipe(recipe)
    resp = await self.client.post(url, json=payload, headers=self._auth_header())
    resp.raise_for_status()
    return resp.json()

  async def get_available_ingredients(self) -> list[dict]:
    await self._ensure_token()
    url = f"{self.base_url}/food-manager/api/ingredients"
    resp = await self.client.get(url, params={"is_available": "true", "limit": 500}, headers=self._auth_header())
    resp.raise_for_status()
    return resp.json()

  async def get_recipes_by_ids(self, ids: list[int]) -> list[dict]:
    await self._ensure_token()
    ids_str = ",".join(str(i) for i in ids)
    url = f"{self.base_url}/food-manager/api/recipes"
    resp = await self.client.get(url, params={"ids": ids_str}, headers=self._auth_header())
    resp.raise_for_status()
    return resp.json()

  async def delete_recipe(self, recipe_id: int) -> None:
    await self._ensure_token()
    url = f"{self.base_url}/food-manager/api/recipes/{recipe_id}"
    resp = await self.client.delete(url, headers=self._auth_header())
    resp.raise_for_status()

  async def close(self):
    await self.client.aclose()
