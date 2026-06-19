from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from database import Base


class EntryTypeEnum(str, enum.Enum):
    INGREDIENT = "ingredient"
    RECIPE = "recipe"
    FREEFORM = "freeform"


class MealTypeEnum(str, enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


class CalorieLog(Base):
    __tablename__ = "calorie_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    entry_type = Column(Enum(EntryTypeEnum, native_enum=False), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="SET NULL"), nullable=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="SET NULL"), nullable=True)
    food_name = Column(String(255), nullable=False)
    quantity_grams = Column(Float, nullable=True)
    servings_eaten = Column(Float, nullable=True)
    calories = Column(Float, nullable=False)
    meal_type = Column(Enum(MealTypeEnum, native_enum=False), nullable=False)
    logged_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User")
    ingredient = relationship("Ingredient")
    recipe = relationship("Recipe")

    def __repr__(self):
        return f"<CalorieLog(id={self.id}, user_id={self.user_id}, food='{self.food_name}', calories={self.calories})>"
