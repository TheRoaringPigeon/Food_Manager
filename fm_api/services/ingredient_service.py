from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, asc, desc, func, nullslast
from models.ingredient import Ingredient, IngredientTypeEnum
from schemas.ingredient import IngredientCreate, IngredientUpdate
from typing import List, Optional

_INGREDIENT_SORT_COLS = {
    'name': Ingredient.name,
    'ingredient_type': Ingredient.ingredient_type,
    'qty': Ingredient.quantity,
    'status': Ingredient.is_available,
}


class IngredientService:

  @staticmethod
  async def create_ingredient(db: AsyncSession, ingredient: IngredientCreate) -> Ingredient:
    db_ingredient = Ingredient(**ingredient.model_dump())
    db.add(db_ingredient)
    await db.commit()
    await db.refresh(db_ingredient)
    return db_ingredient

  @staticmethod
  async def get_ingredient(db: AsyncSession, ingredient_id: int) -> Optional[Ingredient]:
    result = await db.execute(select(Ingredient).filter(Ingredient.id == ingredient_id))
    return result.scalar_one_or_none()

  @staticmethod
  async def get_ingredients(
      db: AsyncSession,
      skip: int = 0,
      limit: int = 100,
      ingredient_type: Optional[IngredientTypeEnum] = None,
      is_available: Optional[bool] = None,
      search: Optional[str] = None,
      sort_by: str = 'name',
      sort_dir: str = 'asc',
  ) -> List[Ingredient]:
    query = select(Ingredient)
    if ingredient_type:
      query = query.filter(Ingredient.ingredient_type == ingredient_type)
    if is_available is not None:
      query = query.filter(Ingredient.is_available == is_available)
    if search:
      search_term = f"%{search}%"
      query = query.filter(
          (Ingredient.name.ilike(search_term)) |
          (Ingredient.description.ilike(search_term)) |
          (Ingredient.tags.ilike(search_term))
      )

    sort_col = _INGREDIENT_SORT_COLS.get(sort_by, Ingredient.name)
    order_expr = desc(sort_col) if sort_dir == 'desc' else asc(sort_col)
    query = query.order_by(order_expr).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

  @staticmethod
  async def count_ingredients(
      db: AsyncSession,
      ingredient_type: Optional[IngredientTypeEnum] = None,
      is_available: Optional[bool] = None,
      search: Optional[str] = None
  ) -> int:
    query = select(func.count()).select_from(Ingredient)
    if ingredient_type:
      query = query.filter(Ingredient.ingredient_type == ingredient_type)
    if is_available is not None:
      query = query.filter(Ingredient.is_available == is_available)
    if search:
      search_term = f"%{search}%"
      query = query.filter(
          (Ingredient.name.ilike(search_term)) |
          (Ingredient.description.ilike(search_term)) |
          (Ingredient.tags.ilike(search_term))
      )
    result = await db.execute(query)
    return result.scalar_one()

  @staticmethod
  async def update_ingredient(
      db: AsyncSession,
      ingredient_id: int,
      ingredient_update: IngredientUpdate
  ) -> Optional[Ingredient]:
    result = await db.execute(select(Ingredient).filter(Ingredient.id == ingredient_id))
    db_ingredient = result.scalar_one_or_none()
    if not db_ingredient:
      return None

    update_data = ingredient_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
      setattr(db_ingredient, field, value)

    await db.commit()
    await db.refresh(db_ingredient)
    return db_ingredient

  @staticmethod
  async def delete_ingredient(db: AsyncSession, ingredient_id: int) -> bool:
    result = await db.execute(select(Ingredient).filter(Ingredient.id == ingredient_id))
    db_ingredient = result.scalar_one_or_none()
    if not db_ingredient:
      return False

    await db.delete(db_ingredient)
    await db.commit()
    return True

  @staticmethod
  async def toggle_availability(db: AsyncSession, ingredient_id: int) -> Optional[Ingredient]:
    result = await db.execute(select(Ingredient).filter(Ingredient.id == ingredient_id))
    db_ingredient = result.scalar_one_or_none()
    if not db_ingredient:
      return None

    db_ingredient.is_available = not db_ingredient.is_available
    await db.commit()
    await db.refresh(db_ingredient)
    return db_ingredient
