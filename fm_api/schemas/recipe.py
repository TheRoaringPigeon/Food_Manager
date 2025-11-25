from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.recipe import RecipeTypeEnum


class RecipeBase(BaseModel):
  name: str = Field(..., min_length=1, max_length=255)
  description: Optional[str] = None
  ingredients: List[str]
  instructions: List[str]
  prep_time: Optional[int] = Field(None, ge=0)
  cook_time: Optional[int] = Field(None, ge=0)
  servings: Optional[int] = Field(None, ge=1)
  recipe_type: RecipeTypeEnum
  tags: Optional[str] = None
  image_url: Optional[str] = None
  is_favorite: Optional[bool] = None


class RecipeCreate(RecipeBase):
  pass


class RecipeUpdate(BaseModel):
  name: Optional[str] = Field(None, min_length=1, max_length=255)
  description: Optional[str] = None
  ingredients: Optional[str] = Field(None, min_length=1)
  instructions: Optional[str] = Field(None, min_length=1)
  prep_time: Optional[int] = Field(None, ge=0)
  cook_time: Optional[int] = Field(None, ge=0)
  servings: Optional[int] = Field(None, ge=1)
  recipe_type: Optional[RecipeTypeEnum] = None
  is_favorite: Optional[bool] = None
  last_cooked: Optional[datetime] = None
  tags: Optional[str] = None
  image_url: Optional[str] = None


class RecipeResponse(RecipeBase):
  id: int
  is_favorite: bool
  last_cooked: Optional[datetime] = None
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True
