from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from database import get_db
from schemas.recipe import RecipeCreate, RecipeUpdate, RecipeResponse, RecipeCount
from services.recipe_service import RecipeService
from models.recipe import RecipeTypeEnum
from models.user import User
from dependencies.auth import get_current_user, require_admin
from constants import API_CONTEXT_PATH

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/recipes",
    tags=["recipes"],
)


@router.post("", response_model=RecipeResponse, status_code=201)
async def create_recipe(
    recipe: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await RecipeService.create_recipe(db, recipe)


@router.get("", response_model=List[RecipeResponse])
async def get_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    recipe_type: Optional[RecipeTypeEnum] = None,
    is_favorite: Optional[bool] = None,
    search: Optional[str] = None,
    ids: Optional[str] = Query(None, description="Comma-separated recipe IDs"),
    max_total_time: Optional[int] = Query(None, ge=1),
    sort_by: str = Query('name', description="name | recipe_type | time | last_cooked"),
    sort_dir: str = Query('asc', description="asc | desc"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    parsed_ids = [int(i) for i in ids.split(",") if i.strip()] if ids else None
    return await RecipeService.get_recipes(
        db,
        family_id=current_user.family_id,
        skip=skip,
        limit=limit,
        recipe_type=recipe_type,
        is_favorite=is_favorite,
        search=search,
        ids=parsed_ids,
        max_total_time=max_total_time,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )


@router.get("/recently-cooked", response_model=List[RecipeResponse])
async def get_recently_cooked(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id:
        return []
    return await RecipeService.get_recently_cooked(db, current_user.family_id, limit)


@router.get("/count", response_model=RecipeCount)
async def count_recipes(
    recipe_type: Optional[RecipeTypeEnum] = None,
    is_favorite: Optional[bool] = None,
    search: Optional[str] = None,
    max_total_time: Optional[int] = Query(None, ge=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total = await RecipeService.count_recipes(
        db,
        family_id=current_user.family_id,
        recipe_type=recipe_type,
        is_favorite=is_favorite,
        search=search,
        max_total_time=max_total_time,
    )
    return RecipeCount(total=total)


@router.get("/by-ingredients")
async def get_recipes_by_ingredients(
    names: List[str] = Query(..., description="Ingredient names to match (repeat param for multiple)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await RecipeService.get_recipes_by_ingredients(db, names)


@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    recipe = await RecipeService.get_recipe(db, recipe_id, current_user.family_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.put("/{recipe_id}", response_model=RecipeResponse)
async def update_recipe(
    recipe_id: int,
    recipe_update: RecipeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    recipe = await RecipeService.update_recipe(db, recipe_id, recipe_update, current_user.family_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.delete("/{recipe_id}", status_code=204)
async def delete_recipe(
    recipe_id: int,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    success = await RecipeService.delete_recipe(db, recipe_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recipe not found")


@router.post("/{recipe_id}/favorite", response_model=RecipeResponse)
async def toggle_favorite(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id:
        raise HTTPException(status_code=400, detail="Must be assigned to a family to track favorites")
    recipe = await RecipeService.toggle_favorite(db, recipe_id, current_user.family_id, current_user.id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.post("/{recipe_id}/cooked", response_model=RecipeResponse)
async def mark_as_cooked(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.family_id:
        raise HTTPException(status_code=400, detail="Must be assigned to a family to track cooked recipes")
    recipe = await RecipeService.mark_as_cooked(db, recipe_id, current_user.family_id, current_user.id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe
