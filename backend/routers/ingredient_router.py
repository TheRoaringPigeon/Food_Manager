from fastapi import APIRouter, Depends, Request
from typing import Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from http import HTTPStatus

from db.db import get_db
from config import settings
from services.ingredient_service import IngredientService
from schemas.ingredient_schema import IngredientModel, IngredientCreateModel
from models.models import Ingredient

from utils.logger import get_logger

logger = get_logger(__name__)


ingredient_service = IngredientService()
router = APIRouter(prefix=f"{settings.root_path_prefix}/v1")

@router.get(
  "/ingredients",
  response_model=List[IngredientModel],
  tags=[settings.ingredient_endpoint_tag]
)
async def get_ingredients(
  request: Request,
  session: AsyncSession = Depends(get_db),
) -> Any:
  """
  This endpoint will get all the ingredients based on page number and page size.
  """
  return await ingredient_service.get_ingredients(session)

@router.get(
  "/ingredient/id/{ingredient_id}",
  tags=[settings.ingredient_endpoint_tag]
)
async def get_ingredient_by_id(
  ingredient_id: int,
  session: AsyncSession = Depends(get_db),
):
  """
  This endpoint will get a specific ingredient based on ingredient ID.
  """
  ingredient = await ingredient_service.get_ingredient_by_id(
    async_session=session,
    ingredient_id=ingredient_id
  )

  return ingredient

@router.get(
  "/ingredient/name/{ingredient_name}",
  tags=[settings.ingredient_endpoint_tag]
)
async def get_ingredient_by_name(
  ingredient_name: str,
  session: AsyncSession = Depends(get_db)
):
  """
  This endpoint will get a specific ingredient based on ingredient name.
  """
  ingredient = await ingredient_service.get_ingredient_by_name(
    async_session=session,
    ingredient_name=ingredient_name
  )

  return ingredient

@router.post(
  "/ingredient",
  tags=[settings.ingredient_endpoint_tag],
  status_code=HTTPStatus.CREATED
)
async def create_ingredient(
  ingredient_data: IngredientCreateModel,
  session: AsyncSession = Depends(get_db)
):
  """
  This endpoint will create a new ingredient
  """
  
  new_ingredient = Ingredient(
    name=ingredient_data.name,
    date_purchased=ingredient_data.date_purchased,
    date_expiring=ingredient_data.date_expiring,
    amount_owned=ingredient_data.amount_owned,
    amount_type=ingredient_data.amount_type
  )

  ingredient = await ingredient_service.create_ingredient(
    async_session=session,
    ingredient=new_ingredient
  )

  return ingredient

@router.delete(
  "/ingredient/{ingredient_id}",
  tags=[settings.ingredient_endpoint_tag],
  status_code=HTTPStatus.OK
)
async def delete_ingredient_by_id(
  ingredient_id: int,
  session: AsyncSession = Depends(get_db)
) -> str:
  """
  This endpoint will delete an ingredient based on the ingredient ID.
  """
  result = await ingredient_service.delete_ingredient_by_id(
    async_session=session,
    ingredient_id=ingredient_id
  )

  return result