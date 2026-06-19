from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date
from typing import List, Optional
from datetime import datetime, timezone, date

from models.calorie_log import CalorieLog, EntryTypeEnum
from models.ingredient import Ingredient
from models.recipe import Recipe
from models.recipe_ingredient import RecipeIngredient
from schemas.calorie_log import CalorieLogCreate, DailyTotalResponse, RecipeCalorieEstimate
from utils.unit_conversion import to_grams


class CalorieLogService:

    @staticmethod
    async def estimate_recipe_calories(db: AsyncSession, recipe_id: int) -> RecipeCalorieEstimate:
        recipe_result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
        recipe = recipe_result.scalar_one_or_none()
        if not recipe:
            return RecipeCalorieEstimate(is_estimate=False)

        # Fast path: use stored value if already computed by the enrichment script
        if recipe.calories_per_serving is not None:
            return RecipeCalorieEstimate(
                total_calories=round(recipe.calories_per_serving * (recipe.servings or 1), 1),
                per_serving=recipe.calories_per_serving,
                servings=recipe.servings,
                is_estimate=False,
            )

        ri_result = await db.execute(
            select(RecipeIngredient).filter(RecipeIngredient.recipe_id == recipe_id)
        )
        recipe_ingredients = ri_result.scalars().all()

        total = 0.0
        partial = False
        for ri in recipe_ingredients:
            if not ri.ingredient_id or ri.quantity is None:
                partial = True
                continue

            ing_result = await db.execute(
                select(Ingredient).filter(Ingredient.id == ri.ingredient_id)
            )
            ing = ing_result.scalar_one_or_none()
            if not ing or ing.calories_per_100g is None:
                partial = True
                continue

            if ri.unit is not None:
                grams = to_grams(ri.quantity, ri.unit)
            elif ing.grams_per_whole_unit is not None:
                grams = ri.quantity * ing.grams_per_whole_unit
            else:
                grams = None

            if grams is None:
                partial = True
                continue

            total += grams * ing.calories_per_100g / 100.0

        servings = recipe.servings
        per_serving = (total / servings) if (servings and servings > 0 and total > 0) else None

        return RecipeCalorieEstimate(
            total_calories=round(total, 1) if total > 0 else None,
            per_serving=round(per_serving, 1) if per_serving is not None else None,
            servings=servings,
            is_estimate=partial,
        )

    @staticmethod
    async def create_log(db: AsyncSession, user_id: int, payload: CalorieLogCreate) -> CalorieLog:
        calories = payload.calories or 0.0
        food_name = payload.food_name or ""

        if payload.entry_type == EntryTypeEnum.INGREDIENT:
            ing_result = await db.execute(
                select(Ingredient).filter(Ingredient.id == payload.ingredient_id)
            )
            ing = ing_result.scalar_one_or_none()
            if ing:
                food_name = food_name or ing.name
                if payload.quantity_grams and ing.calories_per_100g is not None:
                    calories = payload.quantity_grams * ing.calories_per_100g / 100.0

        elif payload.entry_type == EntryTypeEnum.RECIPE:
            recipe_result = await db.execute(
                select(Recipe).filter(Recipe.id == payload.recipe_id)
            )
            recipe = recipe_result.scalar_one_or_none()
            if recipe:
                food_name = food_name or recipe.name
                if payload.calories is None:
                    estimate = await CalorieLogService.estimate_recipe_calories(db, payload.recipe_id)
                    if estimate.per_serving is not None and payload.servings_eaten:
                        calories = estimate.per_serving * payload.servings_eaten

        logged_at = payload.logged_at or datetime.now(timezone.utc)

        db_log = CalorieLog(
            user_id=user_id,
            entry_type=payload.entry_type,
            ingredient_id=payload.ingredient_id,
            recipe_id=payload.recipe_id,
            food_name=food_name,
            quantity_grams=payload.quantity_grams,
            servings_eaten=payload.servings_eaten,
            calories=round(calories, 1),
            meal_type=payload.meal_type,
            logged_at=logged_at,
            notes=payload.notes,
        )
        db.add(db_log)
        await db.commit()
        await db.refresh(db_log)
        return db_log

    @staticmethod
    async def get_logs(
        db: AsyncSession,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[CalorieLog]:
        query = select(CalorieLog).filter(CalorieLog.user_id == user_id)
        if start_date:
            query = query.filter(CalorieLog.logged_at >= start_date)
        if end_date:
            query = query.filter(CalorieLog.logged_at <= end_date)
        query = query.order_by(CalorieLog.logged_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_today_total(db: AsyncSession, user_id: int) -> float:
        today = date.today()
        result = await db.execute(
            select(func.coalesce(func.sum(CalorieLog.calories), 0.0)).filter(
                CalorieLog.user_id == user_id,
                cast(CalorieLog.logged_at, Date) == today,
            )
        )
        return result.scalar() or 0.0

    @staticmethod
    async def get_daily_history(db: AsyncSession, user_id: int, days: int = 14) -> List[DailyTotalResponse]:
        result = await db.execute(
            select(
                cast(CalorieLog.logged_at, Date).label("day"),
                func.sum(CalorieLog.calories).label("total"),
            )
            .filter(CalorieLog.user_id == user_id)
            .group_by("day")
            .order_by("day")
            .limit(days)
        )
        rows = result.all()
        return [DailyTotalResponse(date=str(row.day), total_calories=round(row.total, 1)) for row in rows]

    @staticmethod
    async def delete_log(db: AsyncSession, log_id: int, user_id: int) -> bool:
        result = await db.execute(
            select(CalorieLog).filter(CalorieLog.id == log_id, CalorieLog.user_id == user_id)
        )
        log = result.scalar_one_or_none()
        if not log:
            return False
        await db.delete(log)
        await db.commit()
        return True
