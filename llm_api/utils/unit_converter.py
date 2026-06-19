"""
Centralised unit-to-grams conversion.

Import `estimate_grams` wherever a quantity + unit needs to become a gram weight.
For count-based units (piece, bar, slice, etc.) without a known per-unit gram weight
this module returns None — callers should fall back to an LLM estimate.
"""
from typing import Optional

# Standard weight/volume units → grams
UNIT_TO_GRAMS: dict[str, float] = {
    "g": 1.0,
    "gram": 1.0,
    "grams": 1.0,
    "kg": 1000.0,
    "kilogram": 1000.0,
    "kilograms": 1000.0,
    "mg": 0.001,
    "milligram": 0.001,
    "oz": 28.3495,
    "ounce": 28.3495,
    "ounces": 28.3495,
    "lb": 453.592,
    "lbs": 453.592,
    "pound": 453.592,
    "pounds": 453.592,
    # Volume — water-density approximation (good enough for calorie estimation)
    "ml": 1.0,
    "milliliter": 1.0,
    "milliliters": 1.0,
    "l": 1000.0,
    "liter": 1000.0,
    "liters": 1000.0,
    "tsp": 4.93,
    "teaspoon": 4.93,
    "teaspoons": 4.93,
    "tbsp": 14.79,
    "tablespoon": 14.79,
    "tablespoons": 14.79,
    "cup": 236.59,
    "cups": 236.59,
    "fl oz": 29.57,
    "fl_oz": 29.57,
    "pint": 473.18,
    "pints": 473.18,
    "quart": 946.35,
    "quarts": 946.35,
}

# Count-based units: conversion requires knowing the weight of one unit.
# estimate_grams() uses grams_per_whole_unit from the ingredient record when available.
# When that is absent, callers should use LLM.estimate_portion_grams() as a fallback.
COUNT_UNITS: frozenset[str] = frozenset({
    "piece", "pieces",
    "item", "items",
    "bar", "bars",
    "slice", "slices",
    "whole", "wholes",
    "unit", "units",
    "each",
    "egg", "eggs",
    "clove", "cloves",
    "handful", "handfuls",
    "serving", "servings",
    "portion", "portions",
    "packet", "packets",
    "pack", "packs",
    "can", "cans",
    "bottle", "bottles",
    "scoop", "scoops",
    "wedge", "wedges",
    "sprig", "sprigs",
    "bunch", "bunches",
    "head", "heads",
    "stalk", "stalks",
    "strip", "strips",
    "patty", "patties",
    "fillet", "fillets",
    "breast", "breasts",
    "thigh", "thighs",
    "wing", "wings",
    "link", "links",
    "cube", "cubes",
    "ball", "balls",
    "roll", "rolls",
    "bun", "buns",
    "loaf", "loaves",
})


def estimate_grams(
    quantity: Optional[float],
    unit: Optional[str],
    grams_per_whole_unit: Optional[float] = None,
) -> Optional[float]:
    """
    Convert quantity + unit to grams.

    Returns None when:
    - quantity is None
    - the unit is count-based and grams_per_whole_unit is not provided
    - the unit is unrecognised

    Callers should treat None as a signal to fall back to LLM estimation.
    """
    if quantity is None:
        return None

    unit_lower = (unit or "").lower().strip()

    # Direct weight/volume conversion
    if unit_lower in UNIT_TO_GRAMS:
        return quantity * UNIT_TO_GRAMS[unit_lower]

    # Count unit: use the ingredient's known per-unit weight if available
    if unit_lower in COUNT_UNITS:
        if grams_per_whole_unit:
            return quantity * grams_per_whole_unit
        return None  # caller must use LLM fallback

    # Empty / missing unit — treat as grams if that's the only option
    if not unit_lower:
        return quantity if grams_per_whole_unit is None else quantity * grams_per_whole_unit

    return None  # unrecognised unit — caller must use LLM fallback


def is_count_unit(unit: Optional[str]) -> bool:
    """Return True when the unit is count-based (not a weight or volume)."""
    return (unit or "").lower().strip() in COUNT_UNITS
