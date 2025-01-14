from fastapi import APIRouter, Depends, Request, status
from typing import Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from http import HTTPStatus

from db.db import get_db
from config import settings
from services.recipe_service import RecipeService
from schemas.recipe_schema import RecipeModel, RecipeCreateModel
from models.models import Recipe
from utils.exceptions import FoodManagerException

from utils.logger import get_logger

logger = get_logger(__name__)


recipe_service = RecipeService()
router = APIRouter(prefix=f"{settings.root_path_prefix}/v1")

@router.get(
  "/recipes",
  response_model=List[RecipeModel],
  tags=[settings.recipe_endpoint_tag]
)
async def get_recipes(
  request: Request,
  session: AsyncSession = Depends(get_db),
) -> Any:
  """
  This endpoint will get all the recipes based on page number and page size.
  """
  try:
    recipies = await recipe_service.get_recipes(session)
    return recipies
  except Exception as e:
    print(e)

@router.get(
  "/recipe/id/{recipe_id}",
  tags=[settings.recipe_endpoint_tag]
)
async def get_recipe_by_id(
  recipe_id: int,
  session: AsyncSession = Depends(get_db),
):
  """
  This endpoint will get a specific recipe based on recipe ID.
  """
  recipe = await recipe_service.get_recipe_by_id(
    async_session=session,
    recipe_id=recipe_id
  )

  return recipe

@router.get(
  "/recipe/name/{recipe_name}",
  tags=[settings.recipe_endpoint_tag]
)
async def get_recipe_by_name(
  recipe_name: str,
  session: AsyncSession = Depends(get_db)
):
  """
  This endpoint will get a specific recipe based on recipe name.
  """
  recipe = await recipe_service.get_recipe_by_name(
    async_session=session,
    recipe_name=recipe_name
  )

  return recipe

@router.post(
  "/recipe",
  tags=[settings.recipe_endpoint_tag],
  status_code=HTTPStatus.CREATED
)
async def create_recipe(
  recipe_data: RecipeCreateModel,
  session: AsyncSession = Depends(get_db)
):
  """
  This endpoint will create a new recipe
  """
  try:
    new_recipe = Recipe(
      name=recipe_data.name,
      date_prepared=recipe_data.date_prepared,
      date_expiring=recipe_data.date_expiring,
      amount_owned=recipe_data.amount_owned,
      amount_type=recipe_data.amount_type,
      instructions=recipe_data.instructions,
      description=recipe_data.description,
    )
  except Exception as e:
    message = f"Unable to create recepie: {e}" 
    logger.error(message)
    raise FoodManagerException(
        message=message,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
      )
  recipe = await recipe_service.create_recipe(
    async_session=session,
    recipe=new_recipe,
    ingredients=recipe_data.ingredients
  )

  return recipe

@router.delete(
  "/recipe/{recipe_id}",
  tags=[settings.recipe_endpoint_tag],
  status_code=HTTPStatus.OK
)
async def delete_recipe_by_id(
  recipe_id: int,
  session: AsyncSession = Depends(get_db)
) -> str:
  """
  This endpoint will delete an recipe based on the recipe ID.
  """
  result = await recipe_service.delete_recipe_by_id(
    async_session=session,
    recipe_id=recipe_id
  )

  return result