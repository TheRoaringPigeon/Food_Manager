from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, asc, desc, cast, func, literal, null, nullslast
from sqlalchemy import Text
from sqlalchemy.orm import aliased
from models.recipe import Recipe, RecipeTypeEnum
from models.family_recipe_status import FamilyRecipeStatus
from models.ingredient import Ingredient
from schemas.recipe import RecipeCreate, RecipeUpdate
from typing import List, Optional, Dict, Any
from datetime import datetime


def _build_recipe_dict(recipe: Recipe, is_favorite: bool, last_cooked) -> Dict[str, Any]:
    return {
        "id": recipe.id,
        "name": recipe.name,
        "description": recipe.description,
        "ingredients": recipe.ingredients,
        "instructions": recipe.instructions,
        "prep_time": recipe.prep_time,
        "cook_time": recipe.cook_time,
        "servings": recipe.servings,
        "recipe_type": recipe.recipe_type,
        "tags": recipe.tags,
        "image_url": recipe.image_url,
        "is_favorite": bool(is_favorite),
        "last_cooked": last_cooked,
        "created_at": recipe.created_at,
        "updated_at": recipe.updated_at,
    }


async def _get_recipe_with_status(
    db: AsyncSession, recipe_id: int, family_id: Optional[int]
) -> Optional[Dict[str, Any]]:
    frs = aliased(FamilyRecipeStatus)
    if family_id is not None:
        query = (
            select(
                Recipe,
                func.coalesce(frs.is_favorite, False).label("is_favorite"),
                frs.last_cooked.label("last_cooked"),
            )
            .outerjoin(
                frs,
                (frs.recipe_id == Recipe.id) & (frs.family_id == family_id),
            )
            .filter(Recipe.id == recipe_id)
        )
    else:
        query = (
            select(
                Recipe,
                literal(False).label("is_favorite"),
                null().label("last_cooked"),
            )
            .filter(Recipe.id == recipe_id)
        )

    result = await db.execute(query)
    row = result.first()
    if not row:
        return None
    return _build_recipe_dict(row.Recipe, row.is_favorite, row.last_cooked)


class RecipeService:

    @staticmethod
    async def create_recipe(db: AsyncSession, recipe: RecipeCreate) -> Dict[str, Any]:
        db_recipe = Recipe(**recipe.model_dump())
        db.add(db_recipe)
        await db.commit()
        await db.refresh(db_recipe)
        return _build_recipe_dict(db_recipe, False, None)

    @staticmethod
    async def get_recipe(
        db: AsyncSession, recipe_id: int, family_id: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        return await _get_recipe_with_status(db, recipe_id, family_id)

    @staticmethod
    async def get_recipes(
        db: AsyncSession,
        family_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
        recipe_type: Optional[RecipeTypeEnum] = None,
        is_favorite: Optional[bool] = None,
        search: Optional[str] = None,
        ids: Optional[List[int]] = None,
        max_total_time: Optional[int] = None,
        sort_by: str = 'name',
        sort_dir: str = 'asc',
    ) -> List[Dict[str, Any]]:
        frs = aliased(FamilyRecipeStatus)

        if family_id is not None:
            is_fav_col = func.coalesce(frs.is_favorite, False)
            last_cooked_col = frs.last_cooked
            query = (
                select(Recipe, is_fav_col.label("is_favorite"), last_cooked_col.label("last_cooked"))
                .outerjoin(frs, (frs.recipe_id == Recipe.id) & (frs.family_id == family_id))
            )
        else:
            query = select(Recipe)

        if ids is not None:
            query = query.filter(Recipe.id.in_(ids))
            result = await db.execute(query)
            if family_id is not None:
                rows = result.all()
                return [_build_recipe_dict(r.Recipe, r.is_favorite, r.last_cooked) for r in rows]
            return [_build_recipe_dict(r, False, None) for r in result.scalars().all()]

        if recipe_type:
            query = query.filter(Recipe.recipe_type == recipe_type)

        if is_favorite is not None and family_id is not None:
            query = query.filter(func.coalesce(frs.is_favorite, False) == is_favorite)
        elif is_favorite is not None and family_id is None:
            if is_favorite:
                query = query.filter(literal(False))  # no family = no favorites

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Recipe.name.ilike(search_term)) |
                (Recipe.description.ilike(search_term)) |
                (Recipe.tags.ilike(search_term)) |
                (cast(Recipe.ingredients, Text).ilike(search_term))
            )

        if max_total_time is not None:
            query = query.filter(
                (func.coalesce(Recipe.prep_time, 0) + func.coalesce(Recipe.cook_time, 0)) <= max_total_time
            )

        if sort_by == 'recipe_type':
            sort_col = Recipe.recipe_type
        elif sort_by == 'time':
            sort_col = func.coalesce(Recipe.prep_time, 0) + func.coalesce(Recipe.cook_time, 0)
        elif sort_by == 'last_cooked' and family_id is not None:
            lc = frs.last_cooked
            order_expr = nullslast(desc(lc)) if sort_dir == 'desc' else nullslast(asc(lc))
            query = query.order_by(order_expr).offset(skip).limit(limit)
            result = await db.execute(query)
            rows = result.all()
            return [_build_recipe_dict(r.Recipe, r.is_favorite, r.last_cooked) for r in rows]
        else:
            sort_col = Recipe.name

        order_expr = desc(sort_col) if sort_dir == 'desc' else asc(sort_col)
        query = query.order_by(order_expr).offset(skip).limit(limit)
        result = await db.execute(query)

        if family_id is not None:
            rows = result.all()
            return [_build_recipe_dict(r.Recipe, r.is_favorite, r.last_cooked) for r in rows]
        return [_build_recipe_dict(r, False, None) for r in result.scalars().all()]

    @staticmethod
    async def count_recipes(
        db: AsyncSession,
        family_id: Optional[int] = None,
        recipe_type: Optional[RecipeTypeEnum] = None,
        is_favorite: Optional[bool] = None,
        search: Optional[str] = None,
        max_total_time: Optional[int] = None,
    ) -> int:
        frs = aliased(FamilyRecipeStatus)

        if family_id is not None and is_favorite is not None:
            query = (
                select(func.count())
                .select_from(Recipe)
                .outerjoin(frs, (frs.recipe_id == Recipe.id) & (frs.family_id == family_id))
                .filter(func.coalesce(frs.is_favorite, False) == is_favorite)
            )
        elif is_favorite is not None and family_id is None:
            if is_favorite:
                return 0
            query = select(func.count()).select_from(Recipe)
        else:
            query = select(func.count()).select_from(Recipe)

        if recipe_type:
            query = query.filter(Recipe.recipe_type == recipe_type)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Recipe.name.ilike(search_term)) |
                (Recipe.description.ilike(search_term)) |
                (Recipe.tags.ilike(search_term)) |
                (cast(Recipe.ingredients, Text).ilike(search_term))
            )

        if max_total_time is not None:
            query = query.filter(
                (func.coalesce(Recipe.prep_time, 0) + func.coalesce(Recipe.cook_time, 0)) <= max_total_time
            )

        result = await db.execute(query)
        return result.scalar_one()

    @staticmethod
    async def update_recipe(
        db: AsyncSession,
        recipe_id: int,
        recipe_update: RecipeUpdate,
        family_id: Optional[int] = None,
    ) -> Optional[Dict[str, Any]]:
        result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
        db_recipe = result.scalar_one_or_none()
        if not db_recipe:
            return None

        update_data = recipe_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_recipe, field, value)

        await db.commit()
        await db.refresh(db_recipe)
        return await _get_recipe_with_status(db, recipe_id, family_id)

    @staticmethod
    async def delete_recipe(db: AsyncSession, recipe_id: int) -> bool:
        result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
        db_recipe = result.scalar_one_or_none()
        if not db_recipe:
            return False

        await db.delete(db_recipe)
        await db.commit()
        return True

    @staticmethod
    async def toggle_favorite(
        db: AsyncSession,
        recipe_id: int,
        family_id: int,
        user_id: int,
    ) -> Optional[Dict[str, Any]]:
        recipe_result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
        if not recipe_result.scalar_one_or_none():
            return None

        existing = await db.execute(
            select(FamilyRecipeStatus).filter(
                FamilyRecipeStatus.recipe_id == recipe_id,
                FamilyRecipeStatus.family_id == family_id,
            )
        )
        status_row = existing.scalar_one_or_none()

        if status_row:
            status_row.is_favorite = not status_row.is_favorite
            status_row.user_id = user_id
        else:
            status_row = FamilyRecipeStatus(
                family_id=family_id,
                recipe_id=recipe_id,
                user_id=user_id,
                is_favorite=True,
            )
            db.add(status_row)

        await db.commit()
        return await _get_recipe_with_status(db, recipe_id, family_id)

    @staticmethod
    async def mark_as_cooked(
        db: AsyncSession,
        recipe_id: int,
        family_id: int,
        user_id: int,
    ) -> Optional[Dict[str, Any]]:
        recipe_result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
        recipe_obj = recipe_result.scalar_one_or_none()
        if not recipe_obj:
            return None

        existing = await db.execute(
            select(FamilyRecipeStatus).filter(
                FamilyRecipeStatus.recipe_id == recipe_id,
                FamilyRecipeStatus.family_id == family_id,
            )
        )
        status_row = existing.scalar_one_or_none()

        if status_row:
            status_row.last_cooked = datetime.utcnow()
            status_row.user_id = user_id
        else:
            status_row = FamilyRecipeStatus(
                family_id=family_id,
                recipe_id=recipe_id,
                user_id=user_id,
                last_cooked=datetime.utcnow(),
            )
            db.add(status_row)

        if recipe_obj.ingredients:
            for ing in recipe_obj.ingredients:
                if isinstance(ing, str):
                    name, qty = ing, None
                elif isinstance(ing, dict):
                    name, qty = ing.get("name"), ing.get("quantity")
                else:
                    name, qty = None, None
                if not name or not qty:
                    continue
                inv_result = await db.execute(
                    select(Ingredient).filter(func.lower(Ingredient.name) == name.lower())
                )
                inv = inv_result.scalar_one_or_none()
                if inv and inv.quantity is not None:
                    inv.quantity = max(0.0, inv.quantity - qty)
                    if inv.quantity == 0:
                        inv.is_available = False

        await db.commit()
        return await _get_recipe_with_status(db, recipe_id, family_id)

    @staticmethod
    async def get_recently_cooked(
        db: AsyncSession,
        family_id: int,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        frs = aliased(FamilyRecipeStatus)
        query = (
            select(Recipe, frs.is_favorite.label("is_favorite"), frs.last_cooked.label("last_cooked"))
            .join(frs, (frs.recipe_id == Recipe.id) & (frs.family_id == family_id))
            .filter(frs.last_cooked.isnot(None))
            .order_by(desc(frs.last_cooked))
            .limit(limit)
        )
        result = await db.execute(query)
        rows = result.all()
        return [_build_recipe_dict(r.Recipe, r.is_favorite, r.last_cooked) for r in rows]
