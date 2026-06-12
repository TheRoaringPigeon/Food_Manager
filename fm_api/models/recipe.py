from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from database import Base
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
  instructions = Column(JSONBCompatible, nullable=False)
  prep_time = Column(Integer, nullable=True)
  cook_time = Column(Integer, nullable=True)
  servings = Column(Integer, nullable=True)
  recipe_type = Column(Enum(RecipeTypeEnum), nullable=False, index=True)
  tags = Column(Text, nullable=True)
  image_url = Column(String(500), nullable=True)
  created_at = Column(DateTime, server_default=func.now(), nullable=False)
  updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

  ingredients = relationship(
      "RecipeIngredient",
      back_populates="recipe",
      cascade="all, delete-orphan",
      order_by="RecipeIngredient.sort_order",
  )
  family_statuses = relationship("FamilyRecipeStatus", back_populates="recipe", cascade="all, delete-orphan")

  def __repr__(self):
    return f"<Recipe(id={self.id}, name='{self.name}', type='{self.recipe_type}')>"
