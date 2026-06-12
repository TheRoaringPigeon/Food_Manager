from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from database import get_db
from schemas.ingredient import IngredientCreate, IngredientUpdate, IngredientResponse, IngredientCount
from services.ingredient_service import IngredientService
from models.ingredient import IngredientTypeEnum
from models.user import User
from dependencies.auth import get_current_user
from constants import API_CONTEXT_PATH

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/ingredients",
    tags=["ingredients"],
)


@router.post("", response_model=IngredientResponse, status_code=201)
async def create_ingredient(
    ingredient: IngredientCreate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await IngredientService.create_ingredient(db, ingredient)


@router.get("", response_model=List[IngredientResponse])
async def get_ingredients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    ingredient_type: Optional[IngredientTypeEnum] = None,
    is_available: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: str = Query('name', description="name | ingredient_type | qty | status"),
    sort_dir: str = Query('asc', description="asc | desc"),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await IngredientService.get_ingredients(
        db,
        skip=skip,
        limit=limit,
        ingredient_type=ingredient_type,
        is_available=is_available,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )


@router.get("/count", response_model=IngredientCount)
async def count_ingredients(
    ingredient_type: Optional[IngredientTypeEnum] = None,
    is_available: Optional[bool] = None,
    search: Optional[str] = None,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total = await IngredientService.count_ingredients(
        db,
        ingredient_type=ingredient_type,
        is_available=is_available,
        search=search,
    )
    return IngredientCount(total=total)


@router.get("/{ingredient_id}", response_model=IngredientResponse)
async def get_ingredient(
    ingredient_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ingredient = await IngredientService.get_ingredient(db, ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient


@router.put("/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(
    ingredient_id: int,
    ingredient_update: IngredientUpdate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ingredient = await IngredientService.update_ingredient(db, ingredient_id, ingredient_update)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient


@router.delete("/{ingredient_id}", status_code=204)
async def delete_ingredient(
    ingredient_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    success = await IngredientService.delete_ingredient(db, ingredient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ingredient not found")


@router.post("/{ingredient_id}/availability", response_model=IngredientResponse)
async def toggle_availability(
    ingredient_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ingredient = await IngredientService.toggle_availability(db, ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient
