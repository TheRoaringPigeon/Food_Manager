from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from models.models import (
  Ingredient, Recepie
)
from uuid import UUID as PYTHON_UUID
from datetime import datetime
from utils.logger import get_logger
from typing import TypeVar, List, Optional
from utils.exceptions import FoodManagerException
from fastapi import status

logger = get_logger(__name__)
T = TypeVar("T", Ingredient, Recepie)

class HelperService:
  # Check items exist
  async def ingredient_exists(
      self,
      async_session: async_sessionmaker[AsyncSession],
      ingredient_id: PYTHON_UUID
  ) -> bool:
    statement = select(Ingredient).filter(Ingredient.id == ingredient_id)
    result = await async_session.execute(statement)

    ingredient = result.scalars().first()

    return True if ingredient else False
  
  async def recepie_exists(
      self,
      async_session: async_sessionmaker[AsyncSession],
      recepie_id: PYTHON_UUID
  ) -> bool:
    statement = select(Recepie).filter(Recepie.id == recepie_id)
    result = await async_session.execute(statement)

    recepie = result.scalars().first()

    return True if recepie else False
  
  # Make sure item name exists
  async def check_duplicate_name(
      self,
      item_model: T,
      item_name: str,
      async_session: async_sessionmaker[AsyncSession]
  ):
    statement = select(item_model).filter(
      func.lower(item_model.name) == func.lower(item_name)
    )
    result = await async_session.execute(statement)
    value = result.scalars().first()

    if value:
      raise FoodManagerException(
        message=f"Item '{item_name}' already exists as '{value}'",
        status_code=status.HTTP_400_BAD_REQUEST
        )
    
  # Get methods
  async def get_item_by_id(
      self,
      async_session: async_sessionmaker[AsyncSession],
      item_id: str, 
      item_model: T,
      select_options: Optional[List] = []
  ) -> T:
    query = select(item_model)
    query = query.filter(item_model.id == item_id)
    for option in select_options:
      query = query.options(option)
    
    result = await async_session.execute(query)

    item = result.scalars().first()
    if not item:
      raise FoodManagerException(
        message=f"Item ID {item_id} does not exist",
        status_code=status.HTTP_404_NOT_FOUND
      )
    
    return item
  
  async def get_items(
      self,
      async_session: async_sessionmaker[AsyncSession],
      item_model: T,
      select_options: Optional[List] = []
  ) -> List[T]:
    query = select(item_model)
    for option in select_options:
      query = query.options(option)
    
    result = await async_session.execute(query)

    items = result.scalars().all()
    
    return items

  async def get_item_by_name(
      self,
      async_session: async_sessionmaker[AsyncSession],
      item_model: T,
      item_name: str
  ) -> T:
    statement = select(item_model).filter(
      func.lower(item_model.name) == func.lower(item_name)
    )

    result = await async_session.execute(statement)

    item = result.scalars().first()

    return item