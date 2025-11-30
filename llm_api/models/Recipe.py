
from sqlalchemy import Column, Integer, String
from database import Base
from enum import Enum

class Recipe(Base):
  __tablename__ = "recipe"

  id = Column(Integer, primary_key=True, autoincrement=True)
  url = Column(String(1000), nullable=False, index=True, unique=True)

  def __repr__(self):
    return f"<Recipe(id={self.id} url={self.url})>"

class RecipeTypeEnum(str, Enum):
  BREAKFAST = "breakfast"
  LUNCH = "lunch"
  DINNER = "dinner"
  SNACK = "snack"
  DESSERT = "dessert"
  DRINK = "drink"
  OTHER = "other"


 