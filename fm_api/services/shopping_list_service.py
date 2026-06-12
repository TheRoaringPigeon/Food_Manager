from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from models.recipe import Recipe
from models.recipe_ingredient import RecipeIngredient
from models.ingredient import Ingredient
from typing import List, Dict, Any, Tuple, Optional


class ShoppingListService:

    @staticmethod
    async def generate(
        db: AsyncSession,
        recipe_ids: List[int],
        ingredient_ids: List[int],
    ) -> Dict[str, Any]:
        needed: List[Dict] = []
        available: List[Dict] = []
        unlinked: List[Dict] = []

        # (ingredient_id, unit) → accumulated item dict
        linked: Dict[Tuple[int, Optional[str]], Dict] = {}

        # name (lowercased) → Ingredient, for fallback matching of unlinked recipe ingredients
        pantry_by_name: Dict[str, Ingredient] = {}
        all_ing_rows = await db.execute(select(Ingredient))
        for ing in all_ing_rows.scalars().all():
            pantry_by_name[ing.name.lower()] = ing

        # --- Recipe ingredients ---
        if recipe_ids:
            # Load recipe names keyed by id
            name_rows = await db.execute(
                select(Recipe.id, Recipe.name).where(Recipe.id.in_(recipe_ids))
            )
            recipe_names: Dict[int, str] = {row[0]: row[1] for row in name_rows.all()}

            ri_rows = await db.execute(
                select(RecipeIngredient)
                .options(selectinload(RecipeIngredient.ingredient))
                .where(RecipeIngredient.recipe_id.in_(recipe_ids))
                .order_by(RecipeIngredient.recipe_id, RecipeIngredient.sort_order)
            )
            for ri in ri_rows.scalars().all():
                recipe_name = recipe_names.get(ri.recipe_id, "Unknown")

                if ri.ingredient_id is None:
                    # Try to match by name against the pantry
                    pantry_match = pantry_by_name.get(ri.name.lower())
                    if pantry_match is None:
                        unlinked.append({
                            "name": ri.name,
                            "quantity": ri.quantity,
                            "unit": ri.unit,
                            "recipe_name": recipe_name,
                        })
                        continue
                    # Treat name-matched ingredient as if it were linked
                    ing = pantry_match
                    key = (ing.id, ri.unit)
                    if key in linked:
                        linked[key]["source_recipes"].append(recipe_name)
                        if ri.quantity is not None:
                            if linked[key]["quantity"] is not None:
                                linked[key]["quantity"] += ri.quantity
                            else:
                                linked[key]["quantity"] = ri.quantity
                    else:
                        linked[key] = {
                            "ingredient_id": ing.id,
                            "name": ri.name,
                            "quantity": ri.quantity,
                            "unit": ri.unit,
                            "source_recipes": [recipe_name],
                            "is_available": ing.is_available,
                            "pantry_quantity": ing.quantity,
                            "pantry_unit": ing.unit.value if ing.unit else None,
                        }
                    continue
                else:
                    key = (ri.ingredient_id, ri.unit)
                    if key in linked:
                        linked[key]["source_recipes"].append(recipe_name)
                        if ri.quantity is not None:
                            if linked[key]["quantity"] is not None:
                                linked[key]["quantity"] += ri.quantity
                            else:
                                linked[key]["quantity"] = ri.quantity
                    else:
                        ing = ri.ingredient
                        linked[key] = {
                            "ingredient_id": ri.ingredient_id,
                            "name": ri.name,
                            "quantity": ri.quantity,
                            "unit": ri.unit,
                            "source_recipes": [recipe_name],
                            "is_available": ing.is_available if ing else True,
                            "pantry_quantity": ing.quantity if ing else None,
                            "pantry_unit": ing.unit.value if (ing and ing.unit) else None,
                        }

        # --- Manually added pantry ingredients ---
        if ingredient_ids:
            ing_rows = await db.execute(
                select(Ingredient).where(Ingredient.id.in_(ingredient_ids))
            )
            for ing in ing_rows.scalars().all():
                unit_str = ing.unit.value if ing.unit else None
                key = (ing.id, unit_str)
                if key in linked:
                    linked[key]["source_recipes"].append("manually added")
                else:
                    linked[key] = {
                        "ingredient_id": ing.id,
                        "name": ing.name,
                        "quantity": ing.quantity,
                        "unit": unit_str,
                        "source_recipes": ["manually added"],
                        "is_available": ing.is_available,
                        "pantry_quantity": ing.quantity,
                        "pantry_unit": unit_str,
                    }

        # --- Route linked items to needed / available ---
        for item in linked.values():
            if not item["is_available"]:
                needed.append(item)
                continue

            req_qty = item["quantity"]
            pantry_qty = item.get("pantry_quantity")
            req_unit = (item["unit"] or "").lower()
            pantry_unit = (item.get("pantry_unit") or "").lower()

            if req_qty is not None and pantry_qty is not None and req_unit == pantry_unit:
                if pantry_qty >= req_qty:
                    available.append(item)
                else:
                    item["quantity"] = req_qty - pantry_qty
                    needed.append(item)
            else:
                available.append(item)

        return {"needed": needed, "available": available, "unlinked": unlinked}
