from pydantic import BaseModel, Field
from typing import Any, Dict, Optional


class RecipeUrlBase(BaseModel):
  url: str = Field(..., min_length=1, max_length=1000)


class RecipeCreate(RecipeUrlBase):
  pass


class RecipeResponse(RecipeUrlBase):
  id: int

  class Config:
    from_attributes = True


class RecipeQueryResult(BaseModel):
  id: Optional[str]
  document: Optional[str]
  metadata: Optional[Dict[str, Any]] = None
  distance: Optional[float] = None
