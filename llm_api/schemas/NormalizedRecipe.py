from pydantic import BaseModel
from typing import Optional


class NormalizedRecipe(BaseModel):
    source_url: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    ingredients_raw: list[str] = []
    instructions: list[str] = []
    category: list[str] = []
    cuisine: Optional[str] = None
    keywords: Optional[str] = None
