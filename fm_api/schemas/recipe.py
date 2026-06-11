from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime
from models.recipe import RecipeTypeEnum


class RecipeIngredient(BaseModel):
    name: str
    quantity: Optional[float] = None
    unit: Optional[str] = None


def _normalize_ingredient(v: Any) -> RecipeIngredient:
    if isinstance(v, str):
        return RecipeIngredient(name=v)
    if isinstance(v, dict):
        return RecipeIngredient(**v)
    return v


class RecipeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    ingredients: List[RecipeIngredient]
    instructions: List[str]
    prep_time: Optional[int] = Field(None, ge=0)
    cook_time: Optional[int] = Field(None, ge=0)
    servings: Optional[int] = Field(None, ge=1)
    recipe_type: RecipeTypeEnum
    tags: Optional[str] = None
    image_url: Optional[str] = None

    @field_validator('ingredients', mode='before')
    @classmethod
    def normalize_ingredients(cls, v: List[Any]) -> List[RecipeIngredient]:
        return [_normalize_ingredient(item) for item in v]


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    ingredients: Optional[List[RecipeIngredient]] = None
    instructions: Optional[List[str]] = None
    prep_time: Optional[int] = Field(None, ge=0)
    cook_time: Optional[int] = Field(None, ge=0)
    servings: Optional[int] = Field(None, ge=1)
    recipe_type: Optional[RecipeTypeEnum] = None
    tags: Optional[str] = None
    image_url: Optional[str] = None

    @field_validator('ingredients', mode='before')
    @classmethod
    def normalize_ingredients(cls, v: Any) -> Any:
        if v is None:
            return v
        return [_normalize_ingredient(item) for item in v]


class RecipeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    ingredients: List[RecipeIngredient]
    instructions: List[str]
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: Optional[int] = None
    recipe_type: RecipeTypeEnum
    tags: Optional[str] = None
    image_url: Optional[str] = None
    is_favorite: bool = False
    last_cooked: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @field_validator('ingredients', mode='before')
    @classmethod
    def normalize_ingredients(cls, v: Any) -> Any:
        if v is None:
            return []
        return [_normalize_ingredient(item) for item in v]

    class Config:
        from_attributes = True


class RecipeCount(BaseModel):
    total: int
