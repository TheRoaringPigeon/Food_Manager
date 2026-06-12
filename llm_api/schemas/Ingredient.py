from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class UnitEnum(str, Enum):
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
    SLICES = "slice"
    BUNCH = "bunch"
    CAN = "can"
    PACKAGE = "package"
    BAG = "bag"


class StructuredIngredient(BaseModel):
    name: str = Field(..., description="Clean lowercase name of the ingredient, e.g., 'macaroni noodles'")
    quantity: Optional[float] = Field(None, description="Numerical quantity value, converted to float if necessary")
    unit: Optional[UnitEnum] = Field(None, description="Must match one of the allowed UnitEnum values exactly, or null if it's a raw count")