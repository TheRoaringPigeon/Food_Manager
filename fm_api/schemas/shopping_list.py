from pydantic import BaseModel
from typing import Optional, List


class ShoppingListRequest(BaseModel):
    recipe_ids: List[int] = []
    ingredient_ids: List[int] = []


class ShoppingListItem(BaseModel):
    ingredient_id: int
    name: str
    quantity: Optional[float] = None
    unit: Optional[str] = None
    source_recipes: List[str] = []
    is_available: bool


class UnlinkedItem(BaseModel):
    name: str
    quantity: Optional[float] = None
    unit: Optional[str] = None
    recipe_name: str


class ShoppingListResponse(BaseModel):
    needed: List[ShoppingListItem] = []
    available: List[ShoppingListItem] = []
    unlinked: List[UnlinkedItem] = []
