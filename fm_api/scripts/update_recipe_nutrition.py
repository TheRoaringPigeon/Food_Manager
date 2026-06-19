#!/usr/bin/env python3
"""
Enrich recipes with accurate serving counts and stored calories_per_serving.

Runs in two phases:
  Phase 1 — For ingredients that appear with no unit in any recipe (e.g. "2 eggs",
             "1 banana"), look up or estimate how many grams one whole unit weighs
             and store it as Ingredient.grams_per_whole_unit.

  Phase 2 — For each recipe, extract the true serving count (regex → Ollama → default 4),
             compute total calories using the unit conversion table + grams_per_whole_unit,
             then store Recipe.servings and Recipe.calories_per_serving.

Usage:
    docker compose exec fm_api python scripts/update_recipe_nutrition.py
    docker compose exec fm_api python scripts/update_recipe_nutrition.py --limit 5
    docker compose exec fm_api python scripts/update_recipe_nutrition.py --recipe-id 123
    docker compose exec fm_api python scripts/update_recipe_nutrition.py --force
"""
import asyncio
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import httpx
from sqlalchemy import select

from database import AsyncSessionLocal
from models.ingredient import Ingredient
from models.recipe import Recipe
from models.recipe_ingredient import RecipeIngredient
from utils.unit_conversion import to_grams

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://fm-llm:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_TIMEOUT = 60.0

# Typical gram weight of one whole unit — checked before calling Ollama.
# Keys are lowercase; matched via substring so "large egg" hits "egg".
KNOWN_WEIGHTS: dict[str, float] = {
    "egg": 50.0,
    "large egg": 57.0,
    "banana": 118.0,
    "lemon": 84.0,
    "lime": 67.0,
    "large onion": 150.0,
    "medium onion": 110.0,
    "small onion": 70.0,
    "onion": 110.0,
    "garlic clove": 5.0,
    "clove of garlic": 5.0,
    "large potato": 300.0,
    "medium potato": 150.0,
    "potato": 150.0,
    "carrot": 60.0,
    "tomato": 123.0,
    "apple": 182.0,
    "orange": 131.0,
    "avocado": 200.0,
    "jalapeño": 14.0,
    "jalapeno": 14.0,
    "bell pepper": 150.0,
    "zucchini": 196.0,
    "cucumber": 200.0,
    "celery stalk": 40.0,
    "stalk of celery": 40.0,
    "shallot": 40.0,
    "scallion": 15.0,
    "green onion": 15.0,
}

SERVINGS_PATTERNS = [
    r'\bserves?\s+(\d+)',
    r'\bmakes?\s+(\d+)',
    r'(\d+)\s+servings?',
    r'yield[s]?\s*[:\-]?\s*(\d+)',
    r'(\d+)\s+portions?',
]


async def _ollama_generate(prompt: str, client: httpx.AsyncClient) -> str | None:
    try:
        resp = await client.post(
            f"{OLLAMA_HOST}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=OLLAMA_TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json().get("response", "").strip()
    except Exception as e:
        print(f"    [Ollama error] {e}")
        return None


def _extract_servings_regex(text: str) -> int | None:
    for pattern in SERVINGS_PATTERNS:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            val = int(m.group(1))
            if 1 <= val <= 50:
                return val
    return None


async def _extract_servings_llm(name: str, description: str, instructions_text: str, client: httpx.AsyncClient) -> int | None:
    prompt = (
        f"Recipe: {name}\n"
        f"Description: {description or ''}\n"
        f"Instructions (excerpt): {instructions_text[:600]}\n\n"
        "How many servings does this recipe make? "
        "Reply with ONLY a single integer (e.g. 4). If unsure, reply 4."
    )
    response = await _ollama_generate(prompt, client)
    if response:
        m = re.search(r'\b(\d+)\b', response)
        if m:
            val = int(m.group(1))
            if 1 <= val <= 50:
                return val
    return None


def _instructions_to_text(instructions) -> str:
    if isinstance(instructions, list):
        return " ".join(str(s) for s in instructions)
    return str(instructions) if instructions else ""


# ---------------------------------------------------------------------------
# Phase 1 — grams_per_whole_unit for null-unit ingredients
# ---------------------------------------------------------------------------

async def phase1_populate_grams(db, client: httpx.AsyncClient, recipe_ids: list[int] | None = None) -> None:
    """recipe_ids — when set, only process ingredients appearing in those recipes (faster for --limit runs)."""
    query = (
        select(Ingredient)
        .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
        .where(RecipeIngredient.unit.is_(None))
        .where(Ingredient.grams_per_whole_unit.is_(None))
        .distinct()
    )
    if recipe_ids is not None:
        query = query.where(RecipeIngredient.recipe_id.in_(recipe_ids))
    result = await db.execute(query)
    ingredients = result.scalars().all()

    if not ingredients:
        print("Phase 1: All null-unit ingredients already have grams_per_whole_unit. Skipping.\n")
        return

    print(f"Phase 1: Populating grams_per_whole_unit for {len(ingredients)} ingredient(s)...\n")

    for i, ing in enumerate(ingredients, 1):
        name_lower = ing.name.lower().strip()
        grams = None
        source = None

        # Longest-match first so "large egg" beats "egg"
        for key in sorted(KNOWN_WEIGHTS, key=len, reverse=True):
            if key in name_lower or name_lower in key:
                grams = KNOWN_WEIGHTS[key]
                source = "table"
                break

        if grams is None:
            prompt = (
                f"How many grams does one {ing.name} typically weigh? "
                "Reply with ONLY a single number (e.g. 50). No units, no explanation."
            )
            response = await _ollama_generate(prompt, client)
            if response:
                m = re.search(r'\b(\d+(?:\.\d+)?)\b', response)
                if m:
                    grams = float(m.group(1))
                    source = "LLM"

        if grams is not None:
            ing.grams_per_whole_unit = round(grams, 1)
            print(f"  [{i}/{len(ingredients)}] \"{ing.name}\" → {grams}g  ({source})")
        else:
            print(f"  [{i}/{len(ingredients)}] \"{ing.name}\" → skipped (no data)")

    await db.commit()
    print(f"\nPhase 1 complete.\n")


# ---------------------------------------------------------------------------
# Phase 2 — servings + calories_per_serving for each recipe
# ---------------------------------------------------------------------------

async def _compute_total_calories(db, recipe: Recipe) -> float | None:
    ri_result = await db.execute(
        select(RecipeIngredient).where(RecipeIngredient.recipe_id == recipe.id)
    )
    recipe_ingredients = ri_result.scalars().all()

    total = 0.0
    for ri in recipe_ingredients:
        if not ri.ingredient_id or ri.quantity is None:
            continue
        ing_result = await db.execute(
            select(Ingredient).where(Ingredient.id == ri.ingredient_id)
        )
        ing = ing_result.scalar_one_or_none()
        if not ing or ing.calories_per_100g is None:
            continue

        if ri.unit is not None:
            grams = to_grams(ri.quantity, ri.unit)
        elif ing.grams_per_whole_unit is not None:
            grams = ri.quantity * ing.grams_per_whole_unit
        else:
            grams = None

        if grams is not None:
            total += grams * ing.calories_per_100g / 100.0

    return round(total, 1) if total > 0 else None


async def phase2_process_recipes(db, client: httpx.AsyncClient, limit, recipe_id, force: bool) -> None:
    query = select(Recipe)
    if recipe_id:
        query = query.where(Recipe.id == recipe_id)
    elif not force:
        query = query.where(Recipe.calories_per_serving.is_(None))
    if limit:
        query = query.limit(limit)

    result = await db.execute(query)
    recipes = result.scalars().all()

    if not recipes:
        print("Phase 2: No recipes to process.")
        return

    n = len(recipes)
    print(f"Phase 2: Processing {n} recipe(s)...\n")
    updated = skipped = 0

    for i, recipe in enumerate(recipes, 1):
        instructions_text = _instructions_to_text(recipe.instructions)
        search_text = f"{recipe.name} {recipe.description or ''} {instructions_text}"

        # Serving count — keep existing value if already > 1
        servings = recipe.servings if (recipe.servings and recipe.servings > 1) else None
        source = "existing" if servings else None

        if servings is None:
            servings = _extract_servings_regex(search_text)
            if servings:
                source = "regex"

        if servings is None:
            servings = await _extract_servings_llm(recipe.name, recipe.description, instructions_text, client)
            if servings:
                source = "LLM"

        if servings is None:
            servings = 4
            source = "default"

        total_cals = await _compute_total_calories(db, recipe)
        cals_per_serving = round(total_cals / servings, 1) if total_cals is not None else None

        recipe.servings = servings
        recipe.calories_per_serving = cals_per_serving

        tag = f" ({source})" if source in ("LLM", "default") else ""
        if cals_per_serving is not None:
            print(f"  [{i}/{n}] \"{recipe.name}\" → {servings} servings{tag}, {cals_per_serving} kcal/serving")
            updated += 1
        else:
            print(f"  [{i}/{n}] \"{recipe.name}\" → {servings} servings{tag}, no calorie data")
            skipped += 1

        if i % 50 == 0:
            await db.commit()

    await db.commit()
    print(f"\nPhase 2 complete. {updated} with calories, {skipped} without.\n")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

async def main(limit, recipe_id, force: bool) -> None:
    async with httpx.AsyncClient() as client:
        async with AsyncSessionLocal() as db:
            # Determine which recipe IDs will be processed so Phase 1 can scope itself
            if recipe_id:
                scoped_ids = [recipe_id]
            elif limit:
                # Peek at which recipes Phase 2 will touch
                q = select(Recipe.id)
                if not force:
                    q = q.where(Recipe.calories_per_serving.is_(None))
                q = q.limit(limit)
                r = await db.execute(q)
                scoped_ids = [row[0] for row in r.all()]
            else:
                scoped_ids = None  # full run — Phase 1 processes all null-unit ingredients

            if not recipe_id:
                await phase1_populate_grams(db, client, recipe_ids=scoped_ids)
            await phase2_process_recipes(db, client, limit, recipe_id, force)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Enrich recipes with servings and calories_per_serving.")
    parser.add_argument("--limit", type=int, default=None, help="Process only N recipes (for testing)")
    parser.add_argument("--recipe-id", type=int, default=None, help="Process a single recipe by ID")
    parser.add_argument("--force", action="store_true", help="Re-process recipes already having calories_per_serving")
    args = parser.parse_args()

    asyncio.run(main(args.limit, args.recipe_id, args.force))
