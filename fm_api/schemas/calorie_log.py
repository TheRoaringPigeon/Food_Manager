from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models.calorie_log import EntryTypeEnum, MealTypeEnum


class CalorieLogCreate(BaseModel):
    entry_type: EntryTypeEnum
    ingredient_id: Optional[int] = None
    recipe_id: Optional[int] = None
    food_name: Optional[str] = Field(None, max_length=255)
    quantity_grams: Optional[float] = Field(None, gt=0)
    servings_eaten: Optional[float] = Field(None, gt=0)
    calories: Optional[float] = Field(None, ge=0)
    meal_type: MealTypeEnum
    logged_at: Optional[datetime] = None
    notes: Optional[str] = None


class CalorieLogResponse(BaseModel):
    id: int
    user_id: int
    entry_type: EntryTypeEnum
    ingredient_id: Optional[int] = None
    recipe_id: Optional[int] = None
    food_name: str
    quantity_grams: Optional[float] = None
    servings_eaten: Optional[float] = None
    calories: float
    meal_type: MealTypeEnum
    logged_at: datetime
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DailyTotalResponse(BaseModel):
    date: str
    total_calories: float


class RecipeCalorieEstimate(BaseModel):
    total_calories: Optional[float] = None
    per_serving: Optional[float] = None
    servings: Optional[int] = None
    is_estimate: bool
