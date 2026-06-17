from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from database import get_db
from schemas.calorie_log import CalorieLogCreate, CalorieLogResponse, DailyTotalResponse, RecipeCalorieEstimate
from services.calorie_log_service import CalorieLogService
from models.user import User
from dependencies.auth import get_current_user
from constants import API_CONTEXT_PATH

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/calorie-logs",
    tags=["calorie_logs"],
)


@router.post("", response_model=CalorieLogResponse, status_code=201)
async def create_calorie_log(
    payload: CalorieLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await CalorieLogService.create_log(db, current_user.id, payload)


@router.get("/today", response_model=float)
async def get_today_total(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await CalorieLogService.get_today_total(db, current_user.id)


@router.get("/history", response_model=List[DailyTotalResponse])
async def get_daily_history(
    days: int = Query(14, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await CalorieLogService.get_daily_history(db, current_user.id, days)


@router.get("/recipe/{recipe_id}/estimate", response_model=RecipeCalorieEstimate)
async def get_recipe_estimate(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await CalorieLogService.estimate_recipe_calories(db, recipe_id)


@router.get("", response_model=List[CalorieLogResponse])
async def list_calorie_logs(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await CalorieLogService.get_logs(db, current_user.id, start_date, end_date, skip, limit)


@router.delete("/{log_id}", status_code=204)
async def delete_calorie_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await CalorieLogService.delete_log(db, log_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Log entry not found")
