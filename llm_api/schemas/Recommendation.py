from pydantic import BaseModel


class RecommendationRequest(BaseModel):
  query: str


class RecommendationResponse(BaseModel):
  recipe_id: str
  recipe_name: str
  why: str
  have_ingredients: list[str]
  missing_ingredients: list[str]
  substitutions: dict[str, str]
  description: str | None = None
  ingredients: list | None = None
  instructions: list | None = None
  image_url: str | None = None
  prep_time: int | None = None
  cook_time: int | None = None
