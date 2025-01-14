from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
from models.models import Recipe, IngredientUsedInRecipe
from services.helper_service import HelperService
from services.ingredient_service import IngredientService
from utils.logger import get_logger
from typing import List
from fastapi import status

from utils.exceptions import FoodManagerException

logger = get_logger(__name__)
helper_service = HelperService()
ingredient_service = IngredientService()


class RecipeService:
    def raise_exception(self, message: str, status: status):
        logger.error(message)
        raise FoodManagerException(message=message, status_code=status)

    async def create_ingredient_used_in_recipe(
        self,
        async_session: async_sessionmaker[AsyncSession],
        recipe_id: int,
        ingredient_id: int,
        amount_used: float,
        amount_type: str,
    ) -> IngredientUsedInRecipe:
        try:
            ingredient_in_recipe = IngredientUsedInRecipe(
                recipe_id=recipe_id,
                ingredient_id=ingredient_id,
                amount_used=amount_used,
                amount_type=amount_type
            )
            async_session.add(ingredient_in_recipe)
        except Exception as e:
            self.raise_exception(f"Unable to create IngredientUsedInRecipe: {e}")

    async def create_recipe(
        self,
        async_session: async_sessionmaker[AsyncSession],
        recipe: Recipe,
        ingredients: list[dict],
    ) -> Recipe:
        logger.info("Creating Recipe")
        await helper_service.check_duplicate_name(
            item_model=Recipe, item_name=recipe.name, async_session=async_session
        )

        async_session.add(recipe)

        for ingredient in ingredients:
            for ingredient_name, details in ingredient.items():
              ingredient_amount = details.get("amount", {})
              ingredient_type = details.get("amount_type", {})
              if not ingredient_name or not ingredient_amount or not ingredient_type:
                  self.raise_exception(f"Missing name, amount, or amount_type for '{ingredient}'")
              found_ingredient = await ingredient_service.get_ingredient_by_name(
                  async_session=async_session, ingredient_name=ingredient_name
              )
              if not found_ingredient:
                  self.raise_exception(
                      f"No ingredient in database named '{ingredient_name}'"
                  )
              await self.create_ingredient_used_in_recipe(
                  async_session=async_session,
                  recipe_id=recipe.id,
                  ingredient_id=found_ingredient.id,
                  amount_used=ingredient_amount,
                  amount_type=ingredient_type
              )

        await async_session.commit()
        await async_session.refresh(recipe)

        return recipe

    async def delete_recipe_by_id(
        self,
        async_session: async_sessionmaker[AsyncSession],
        recipe_id: str,
    ) -> str:
        logger.info("Deleting Recipe")
        recipe = await helper_service.get_item_by_id(
            async_session=async_session, item_id=recipe_id, item_model=Recipe
        )

        await async_session.delete(recipe)
        await async_session.commit()

        return f"Deleted Recipe with ID {recipe_id}"

    async def get_recipes(
        self,
        async_session: async_sessionmaker[AsyncSession],
    ) -> List[Recipe]:
        logger.info("Getting all Recipes")
        recipes = await helper_service.get_items(
            async_session=async_session,
            item_model=Recipe,
        )

        return recipes

    async def get_recipe_by_id(
        self, async_session: async_sessionmaker[AsyncSession], recipe_id: str
    ) -> Recipe:
        logger.info(f"Getting Recipe with id: {recipe_id}")
        recipe = await helper_service.get_item_by_id(
            async_session=async_session, item_id=recipe_id, item_model=Recipe
        )

        return recipe

    async def get_recipe_by_name(
        self, async_session: async_sessionmaker[AsyncSession], recipe_name: str
    ) -> Recipe:
        logger.info(f"Getting Recipe with name: {recipe_name}")
        recipe = await helper_service.get_item_by_name(
            async_session=async_session, item_name=recipe_name, item_model=Recipe
        )

        return recipe
