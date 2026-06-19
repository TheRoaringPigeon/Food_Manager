from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Float
from sqlalchemy.sql import func
import enum
from database import Base


class IngredientTypeEnum(str, enum.Enum):
    PRODUCE = "produce"
    MEAT = "meat"
    DAIRY = "dairy"
    GRAIN = "grain"
    SPICE = "spice"
    CONDIMENT = "condiment"
    BEVERAGE = "beverage"
    OTHER = "other"


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    ingredient_type = Column(Enum(IngredientTypeEnum), nullable=False, index=True)
    tags = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    calories_per_100g = Column(Float, nullable=True)
    grams_per_whole_unit = Column(Float, nullable=True)
    usda_fdc_id = Column(String(20), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Ingredient(id={self.id}, name='{self.name}', type='{self.ingredient_type}')>"
