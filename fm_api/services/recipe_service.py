from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, cast, func
from sqlalchemy import Text
from models.recipe import Recipe, RecipeTypeEnum
from schemas.recipe import RecipeCreate, RecipeUpdate
from typing import List, Optional
from datetime import datetime


class RecipeService:

  @staticmethod
  async def create_recipe(db: AsyncSession, recipe: RecipeCreate) -> Recipe:
    """Create a new recipe"""
    db_recipe = Recipe(**recipe.model_dump())
    db.add(db_recipe)
    await db.commit()
    await db.refresh(db_recipe)
    return db_recipe

  @staticmethod
  async def get_recipe(db: AsyncSession, recipe_id: int) -> Optional[Recipe]:
    """Get a recipe by ID"""
    result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
    return result.scalar_one_or_none()

  @staticmethod
  async def get_recipes(
      db: AsyncSession,
      skip: int = 0,
      limit: int = 100,
      recipe_type: Optional[RecipeTypeEnum] = None,
      is_favorite: Optional[bool] = None,
      search: Optional[str] = None,
      ids: Optional[List[int]] = None,
      max_total_time: Optional[int] = None
  ) -> List[Recipe]:
    """Get all recipes with optional filtering"""
    query = select(Recipe)

    if ids is not None:
      query = query.filter(Recipe.id.in_(ids))
      result = await db.execute(query)
      return result.scalars().all()

    if recipe_type:
      query = query.filter(Recipe.recipe_type == recipe_type)

    if is_favorite is not None:
      query = query.filter(Recipe.is_favorite == is_favorite)

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

    query = query.order_by(desc(Recipe.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

  @staticmethod
  async def count_recipes(
      db: AsyncSession,
      recipe_type: Optional[RecipeTypeEnum] = None,
      is_favorite: Optional[bool] = None,
      search: Optional[str] = None,
      max_total_time: Optional[int] = None
  ) -> int:
    query = select(func.count()).select_from(Recipe)

    if recipe_type:
      query = query.filter(Recipe.recipe_type == recipe_type)

    if is_favorite is not None:
      query = query.filter(Recipe.is_favorite == is_favorite)

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
      recipe_update: RecipeUpdate
  ) -> Optional[Recipe]:
    """Update a recipe"""
    result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
    db_recipe = result.scalar_one_or_none()
    if not db_recipe:
      return None

    update_data = recipe_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
      setattr(db_recipe, field, value)

    await db.commit()
    await db.refresh(db_recipe)
    return db_recipe

  @staticmethod
  async def delete_recipe(db: AsyncSession, recipe_id: int) -> bool:
    """Delete a recipe"""
    result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
    db_recipe = result.scalar_one_or_none()
    if not db_recipe:
      return False

    await db.delete(db_recipe)
    await db.commit()
    return True

  @staticmethod
  async def toggle_favorite(db: AsyncSession, recipe_id: int) -> Optional[Recipe]:
    """Toggle favorite status of a recipe"""
    result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
    db_recipe = result.scalar_one_or_none()
    if not db_recipe:
      return None

    db_recipe.is_favorite = not db_recipe.is_favorite
    await db.commit()
    await db.refresh(db_recipe)
    return db_recipe

  @staticmethod
  async def mark_as_cooked(db: AsyncSession, recipe_id: int) -> Optional[Recipe]:
    """Mark a recipe as cooked (update last_cooked timestamp)"""
    result = await db.execute(select(Recipe).filter(Recipe.id == recipe_id))
    db_recipe = result.scalar_one_or_none()
    if not db_recipe:
      return None

    db_recipe.last_cooked = datetime.utcnow()
    await db.commit()
    await db.refresh(db_recipe)
    return db_recipe

  @staticmethod
  async def get_recently_cooked(db: AsyncSession, limit: int = 10) -> List[Recipe]:
    """Get recently cooked recipes"""
    query = select(Recipe).filter(Recipe.last_cooked.isnot(None)).order_by(desc(Recipe.last_cooked)).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
