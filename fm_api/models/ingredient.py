from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, Float
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


class UnitEnum(str, enum.Enum):
    # Volume — imperial
    TSP = "tsp"
    TBSP = "tbsp"
    FL_OZ = "fl_oz"
    CUP = "cup"
    PINT = "pint"
    QUART = "quart"
    GALLON = "gallon"
    # Volume — metric
    ML = "ml"
    LITER = "liter"
    # Weight — imperial
    OZ = "oz"
    LB = "lb"
    # Weight — metric
    G = "g"
    KG = "kg"
    # Count
    WHOLE = "whole"
    DOZEN = "dozen"
    # Package / specialty
    PINCH = "pinch"
    DASH = "dash"
    CLOVE = "clove"
    SLICE = "slice"
    BUNCH = "bunch"
    CAN = "can"
    PACKAGE = "package"
    BAG = "bag"


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    ingredient_type = Column(Enum(IngredientTypeEnum), nullable=False, index=True)
    quantity = Column(Float, nullable=True)
    unit = Column(Enum(UnitEnum, name="unitenum", values_callable=lambda obj: [e.value for e in obj]), nullable=True)
    is_available = Column(Boolean, default=True, index=True)
    tags = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Ingredient(id={self.id}, name='{self.name}', type='{self.ingredient_type}')>"
