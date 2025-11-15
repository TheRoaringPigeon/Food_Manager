from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models.ingredient import IngredientTypeEnum


class IngredientBase(BaseModel):
  name: str = Field(..., min_length=1, max_length=255)
  description: Optional[str] = None
  ingredient_type: IngredientTypeEnum
  quantity: Optional[float] = Field(None, ge=0)
  unit: Optional[str] = Field(None, max_length=50)
  tags: Optional[str] = None
  image_url: Optional[str] = None
  is_available: Optional[bool] = True


class IngredientCreate(IngredientBase):
  pass


class IngredientUpdate(BaseModel):
  name: Optional[str] = Field(None, min_length=1, max_length=255)
  description: Optional[str] = None
  ingredient_type: Optional[IngredientTypeEnum] = None
  quantity: Optional[float] = Field(None, ge=0)
  unit: Optional[str] = Field(None, max_length=50)
  tags: Optional[str] = None
  image_url: Optional[str] = None
  is_available: Optional[bool] = None


class IngredientResponse(IngredientBase):
  id: int
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True
