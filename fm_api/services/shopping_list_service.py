from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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
        unlinked: List[Dict] = []

        # (ingredient_id, unit) → accumulated item dict
        linked: Dict[Tuple[int, Optional[str]], Dict] = {}

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
                    unlinked.append({
                        "name": ri.name,
                        "quantity": ri.quantity,
                        "unit": ri.unit,
                        "recipe_name": recipe_name,
                    })
                    continue

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
                    }

        # --- Manually added pantry ingredients ---
        if ingredient_ids:
            ing_rows = await db.execute(
                select(Ingredient).where(Ingredient.id.in_(ingredient_ids))
            )
            for ing in ing_rows.scalars().all():
                key = (ing.id, None)
                if key in linked:
                    linked[key]["source_recipes"].append("manually added")
                else:
                    linked[key] = {
                        "ingredient_id": ing.id,
                        "name": ing.name,
                        "quantity": None,
                        "unit": None,
                        "source_recipes": ["manually added"],
                    }

        needed.extend(linked.values())

        return {"needed": needed, "unlinked": unlinked}
