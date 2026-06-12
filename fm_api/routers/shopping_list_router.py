from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.shopping_list import ShoppingListRequest, ShoppingListResponse
from services.shopping_list_service import ShoppingListService
from models.user import User
from dependencies.auth import get_current_user
from constants import API_CONTEXT_PATH

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/shopping-list",
    tags=["shopping-list"],
)


@router.post("/generate", response_model=ShoppingListResponse)
async def generate_shopping_list(
    body: ShoppingListRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ShoppingListService.generate(db, body.recipe_ids, body.ingredient_ids)
