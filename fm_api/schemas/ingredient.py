from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models.ingredient import IngredientTypeEnum


class IngredientBase(BaseModel):
  name: str = Field(..., min_length=1, max_length=255)
  description: Optional[str] = None
  ingredient_type: IngredientTypeEnum
  tags: Optional[str] = None
  image_url: Optional[str] = None
  is_available: Optional[bool] = True


class IngredientCreate(IngredientBase):
  pass


class IngredientUpdate(BaseModel):
  name: Optional[str] = Field(None, min_length=1, max_length=255)
  description: Optional[str] = None
  ingredient_type: Optional[IngredientTypeEnum] = None
  tags: Optional[str] = None
  image_url: Optional[str] = None
  is_available: Optional[bool] = None
  calories_per_100g: Optional[float] = None
  usda_fdc_id: Optional[str] = None


class IngredientResponse(IngredientBase):
  id: int
  calories_per_100g: Optional[float] = None
  usda_fdc_id: Optional[str] = None
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True


class IngredientMergeRequest(BaseModel):
  keep_id: int
  delete_id: int


class IngredientCount(BaseModel):
  total: int
