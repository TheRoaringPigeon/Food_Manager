from pydantic import BaseModel, Field


class RecipeUrlBase(BaseModel):
  url: str = Field(..., min_length=1, max_length=1000)


class RecipeCreate(RecipeUrlBase):
  pass


class RecipeResponse(RecipeUrlBase):
  id: int

  class Config:
    from_attributes = True
