from db.db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Float, String, DateTime, ForeignKey
from datetime import datetime, timedelta, timezone

from typing import List


def time_now():
    return datetime.now(timezone.utc)


# Helper function to calculate the default expiration date
def one_month_from_now():
    return time_now() + timedelta(days=30)


"""Many-to-Many relationship between Ingredients and Recipes"""


class IngredientUsedInRecipe(Base):
    __tablename__ = "ingredient_used_in_recipe"

    recipe_id = mapped_column(ForeignKey("recipe.id"), primary_key=True)
    ingredient_id = mapped_column(ForeignKey("ingredient.id"), primary_key=True)
    amount_used: Mapped[float] = mapped_column(Float, nullable=False)
    amount_type: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relationships for accessing ingredient and recipe directly
    ingredient = relationship("Ingredient", back_populates="ingredient_link")
    recipe = relationship("Recipe", back_populates="recipe_link")


"""
class Ingredient:
  id int
  name string
  date_purchased DateTime
  date_expiring DateTime
  amount_owned Float
  amount_type String
"""


class Ingredient(Base):
    __tablename__ = "ingredient"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_purchased = mapped_column(DateTime, default=time_now)
    date_expiring = mapped_column(DateTime, default=one_month_from_now)
    amount_owned: Mapped[float] = mapped_column(Float, nullable=False)
    amount_type: Mapped[str] = mapped_column(String(50), nullable=False)

    # Many-to-Many relationship between ingredients and recipes
    ingredient_link: Mapped[List["IngredientUsedInRecipe"]] = relationship(
        back_populates="ingredient"
    )


"""
class Recipe:
  id UUID
  name string
  description string
  instructions string
  date_prepared DateTime
  date_expiring DateTime
  amount_owned Float
  amount_type String
"""


class Recipe(Base):
    __tablename__ = "recipe"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    instructions: Mapped[str] = mapped_column(String(1000), nullable=False)
    date_prepared = mapped_column(DateTime, default=time_now)
    date_expiring = mapped_column(DateTime, default=one_month_from_now)
    amount_owned: Mapped[float] = mapped_column(Float, nullable=False)
    amount_type: Mapped[str] = mapped_column(String(50), nullable=False)
 
    recipe_link: Mapped[List["IngredientUsedInRecipe"]] = relationship(
        back_populates="recipe"
    )
