from typing import Optional

# Grams per one unit. Covers all units tracked in the recipe_ingredients unit enum.
# Volumetric units use water density (1ml ≈ 1g) as a baseline approximation.
# Count/pack units (clove, slice, bunch, can, package, bag, whole, dozen, pinch, dash)
# are omitted intentionally — they have no generic gram equivalent and must be
# handled via Ingredient.grams_per_whole_unit instead.
UNIT_TO_GRAMS: dict[str, float] = {
    # weight
    'g': 1.0,
    'kg': 1000.0,
    'oz': 28.3495,
    'lb': 453.592,
    # volume (water-density baseline)
    'ml': 1.0,
    'liter': 1000.0,
    'tsp': 4.92892,
    'tbsp': 14.7868,
    'fl_oz': 29.5735,
    'cup': 236.588,
    'pint': 473.176,
    'quart': 946.353,
    'gallon': 3785.41,
}


def to_grams(quantity: Optional[float], unit: Optional[str]) -> Optional[float]:
    """Convert a recipe ingredient quantity to grams.

    Returns None if the unit has no generic gram equivalent (count/pack units)
    or if quantity is None. Caller should skip the ingredient when None is returned.
    """
    if quantity is None:
        return None
    if unit is None:
        return None
    factor = UNIT_TO_GRAMS.get(unit.lower().strip())
    if factor is None:
        return None
    return quantity * factor
