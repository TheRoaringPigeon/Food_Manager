from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from schemas.family import FamilyResponse, FamilyCreate
from services.family_service import FamilyService
from dependencies.auth import require_admin
from models.user import User
from constants import API_CONTEXT_PATH

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/families",
    tags=["families"],
)


@router.get("", response_model=List[FamilyResponse])
async def get_families(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await FamilyService.get_families(db)


@router.post("", response_model=FamilyResponse, status_code=201)
async def create_family(
    payload: FamilyCreate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    existing = await FamilyService.get_family_by_name(db, payload.name)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Family name already exists")
    return await FamilyService.create_family(db, payload.name)


@router.get("/{family_id}", response_model=FamilyResponse)
async def get_family(
    family_id: int,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    family = await FamilyService.get_family_by_id(db, family_id)
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    return family
