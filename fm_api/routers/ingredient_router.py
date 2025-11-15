from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from database import get_db
from schemas.ingredient import IngredientCreate, IngredientUpdate, IngredientResponse
from services.ingredient_service import IngredientService
from models.ingredient import IngredientTypeEnum
from constants import API_CONTEXT_PATH

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/ingredients",
    tags=["ingredients"]
)


@router.post("", response_model=IngredientResponse, status_code=201)
async def create_ingredient(
    ingredient: IngredientCreate,
    db: AsyncSession = Depends(get_db)
):
  """Create a new ingredient"""
  return await IngredientService.create_ingredient(db, ingredient)


@router.get("", response_model=List[IngredientResponse])
async def get_ingredients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    ingredient_type: Optional[IngredientTypeEnum] = None,
    is_available: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
  """Get all ingredients with optional filters"""
  return await IngredientService.get_ingredients(
      db,
      skip=skip,
      limit=limit,
      ingredient_type=ingredient_type,
      is_available=is_available,
      search=search
  )


@router.get("/{ingredient_id}", response_model=IngredientResponse)
async def get_ingredient(
    ingredient_id: int,
    db: AsyncSession = Depends(get_db)
):
  """Get a specific ingredient by ID"""
  ingredient = IngredientService.get_ingredient(db, ingredient_id)
  if not ingredient:
    raise HTTPException(status_code=404, detail="Ingredient not found")
  return await ingredient


@router.put("/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(
    ingredient_id: int,
    ingredient_update: IngredientUpdate,
    db: AsyncSession = Depends(get_db)
):
  """Update an ingredient"""
  ingredient = IngredientService.update_ingredient(db, ingredient_id, ingredient_update)
  if not ingredient:
    raise HTTPException(status_code=404, detail="Ingredient not found")
  return await ingredient


@router.delete("/{ingredient_id}", status_code=204)
async def delete_ingredient(
    ingredient_id: int,
    db: AsyncSession = Depends(get_db)
):
  """Delete an ingredient"""
  success = IngredientService.delete_ingredient(db, ingredient_id)
  if not success:
    raise HTTPException(status_code=404, detail="Ingredient not found")


@router.post("/{ingredient_id}/availability", response_model=IngredientResponse)
async def toggle_availability(
    ingredient_id: int,
    db: AsyncSession = Depends(get_db)
):
  """Toggle availability status of an ingredient"""
  ingredient = IngredientService.toggle_availability(db, ingredient_id)
  if not ingredient:
    raise HTTPException(status_code=404, detail="Ingredient not found")
  return await ingredient
