from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum
from sqlalchemy.sql import func
import enum
from models import Base
from models.types import JSONBCompatible


class RecipeTypeEnum(str, enum.Enum):
  BREAKFAST = "breakfast"
  LUNCH = "lunch"
  DINNER = "dinner"
  SNACK = "snack"
  DESSERT = "dessert"
  DRINK = "drink"
  OTHER = "other"


class Recipe(Base):
  __tablename__ = "recipes"

  id = Column(Integer, primary_key=True, index=True)
  name = Column(String(255), nullable=False, index=True)
  description = Column(Text, nullable=True)
  ingredients = Column(JSONBCompatible, nullable=False)
  instructions = Column(JSONBCompatible, nullable=False)
  prep_time = Column(Integer, nullable=True)
  cook_time = Column(Integer, nullable=True)
  servings = Column(Integer, nullable=True)
  recipe_type = Column(Enum(RecipeTypeEnum), nullable=False, index=True)
  is_favorite = Column(Boolean, default=False, index=True)
  last_cooked = Column(DateTime, nullable=True)
  tags = Column(Text, nullable=True)
  image_url = Column(String(500), nullable=True)
  created_at = Column(DateTime, server_default=func.now(), nullable=False)
  updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

  def __repr__(self):
    return f"<Recipe(id={self.id}, name='{self.name}', type='{self.recipe_type}')>"
