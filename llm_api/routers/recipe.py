from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from database import get_db
from schemas.Recipe import RecipeCreate, RecipeResponse
from services.recipe_service import RecipeService
from constants import API_CONTEXT_PATH

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/recipes",
    tags=["recipes"]
)


@router.post("", response_model=RecipeResponse, status_code=201)
async def create_recipe(
    recipe: RecipeCreate,
    db: AsyncSession = Depends(get_db)
):
  """Create a new recipe"""
  return await RecipeService.create_recipe(db, recipe)


@router.get("", response_model=List[RecipeResponse])
async def get_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
  """Get all recipes with pagination"""
  return await RecipeService.get_recipes(
      db,
      skip=skip,
      limit=limit,
  )


@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: int,
    db: AsyncSession = Depends(get_db)
):
  """Get a specific recipe by ID"""
  recipe = RecipeService.get_recipe(db, recipe_id)
  if not recipe:
    raise HTTPException(status_code=404, detail="Recipe not found")
  return await recipe


@router.delete("/{recipe_id}", status_code=204)
async def delete_recipe(
    recipe_id: int,
    db: AsyncSession = Depends(get_db)
):
  """Delete a recipe"""
  success = RecipeService.delete_recipe(db, recipe_id)
  if not success:
    raise HTTPException(status_code=404, detail="Recipe not found")
