from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
from models.models import Ingredient
from services.helper_service import HelperService
from utils.logger import get_logger
from typing import List

logger = get_logger(__name__)
helper_service = HelperService()

class IngredientService:
  async def create_ingredient(
      self, 
      async_session: async_sessionmaker[AsyncSession],
      ingredient: Ingredient
  ) -> Ingredient:
    logger.info("Creating Ingredient")
    await helper_service.check_duplicate_name(
      item_model=Ingredient,
      item_name=ingredient.name,
      async_session=async_session
    )
    async_session.add(ingredient)
    await async_session.commit()
    await async_session.refresh(ingredient)

    return ingredient
  
  async def delete_ingredient_by_id(
      self, 
      async_session: async_sessionmaker[AsyncSession],
      ingredient_id: str,
  ) -> str:
    logger.info("Deleting Ingredient")
    ingredient = await helper_service.get_item_by_id(
      async_session=async_session,
      item_id=ingredient_id,
      item_model=Ingredient
    )

    await async_session.delete(ingredient)
    await async_session.commit()

    return f"Deleted Ingredient with ID {ingredient_id}"
  
  async def get_ingredients(
      self,
      async_session: async_sessionmaker[AsyncSession],
  ) -> List[Ingredient]:
    logger.info("Getting all Ingredients")
    ingredients = await helper_service.get_items(
      async_session=async_session,
      item_model=Ingredient,
    )

    return ingredients
  
  async def get_ingredient_by_id(
      self,
      async_session: async_sessionmaker[AsyncSession],
      ingredient_id: str
  ) -> Ingredient:
    logger.info(f"Getting Ingredient with id: {ingredient_id}")
    ingredient = await helper_service.get_item_by_id(
      async_session=async_session,
      item_id=ingredient_id,
      item_model=Ingredient
    )

    return ingredient
  
  async def get_ingredient_by_name(
      self,
      async_session: async_sessionmaker[AsyncSession],
      ingredient_name: str
  ) -> Ingredient:
    logger.info(f"Getting Ingredient with name: {ingredient_name}")
    ingredient = await helper_service.get_item_by_name(
      async_session=async_session,
      item_name=ingredient_name,
      item_model=Ingredient
    )

    return ingredient
