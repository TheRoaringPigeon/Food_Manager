from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas.recipe import RecipeCreate, RecipeUpdate, RecipeResponse
from services.recipe_service import RecipeService
from models.recipe import RecipeTypeEnum
from constants import API_CONTEXT_PATH

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/recipes",
    tags=["recipes"]
)

@router.post("", response_model=RecipeResponse, status_code=201)
async def create_recipe(
    recipe: RecipeCreate,
    db: Session = Depends(get_db)
):
    """Create a new recipe"""
    return RecipeService.create_recipe(db, recipe)

@router.get("", response_model=List[RecipeResponse])
async def get_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    recipe_type: Optional[RecipeTypeEnum] = None,
    is_favorite: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all recipes with optional filters"""
    return RecipeService.get_recipes(
        db,
        skip=skip,
        limit=limit,
        recipe_type=recipe_type,
        is_favorite=is_favorite,
        search=search
    )

@router.get("/recently-cooked", response_model=List[RecipeResponse])
async def get_recently_cooked(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get recently cooked recipes"""
    return RecipeService.get_recently_cooked(db, limit)

@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific recipe by ID"""
    recipe = RecipeService.get_recipe(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.put("/{recipe_id}", response_model=RecipeResponse)
async def update_recipe(
    recipe_id: int,
    recipe_update: RecipeUpdate,
    db: Session = Depends(get_db)
):
    """Update a recipe"""
    recipe = RecipeService.update_recipe(db, recipe_id, recipe_update)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.delete("/{recipe_id}", status_code=204)
async def delete_recipe(
    recipe_id: int,
    db: Session = Depends(get_db)
):
    """Delete a recipe"""
    success = RecipeService.delete_recipe(db, recipe_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recipe not found")

@router.post("/{recipe_id}/favorite", response_model=RecipeResponse)
async def toggle_favorite(
    recipe_id: int,
    db: Session = Depends(get_db)
):
    """Toggle favorite status of a recipe"""
    recipe = RecipeService.toggle_favorite(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.post("/{recipe_id}/cooked", response_model=RecipeResponse)
async def mark_as_cooked(
    recipe_id: int,
    db: Session = Depends(get_db)
):
    """Mark a recipe as cooked (updates last_cooked timestamp)"""
    recipe = RecipeService.mark_as_cooked(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe