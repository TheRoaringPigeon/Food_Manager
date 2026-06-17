from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from schemas.user import (
    UserResponse, UserCreate, AssignFamilyRequest, ChangeRoleRequest,
    UpdateUserPayload, ChangePasswordRequest,
)
from services.user_service import UserService
from services.family_service import FamilyService
from dependencies.auth import get_current_user, require_admin
from models.user import User
from constants import API_CONTEXT_PATH

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/users",
    tags=["users"],
)


@router.get("", response_model=List[UserResponse])
async def get_users(
    include_inactive: bool = Query(False),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await UserService.get_users(db, include_inactive=include_inactive)


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(
    payload: UserCreate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    existing = await UserService.get_user_by_username(db, payload.username)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
    try:
        return await UserService.create_user(
            db,
            username=payload.username,
            password=payload.password,
            role=payload.role,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role.value != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    user = await UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    payload: UpdateUserPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if payload.username:
        existing = await UserService.get_user_by_username(db, payload.username)
        if existing and existing.id != user_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
    try:
        user = await UserService.update_user(
            db, user_id,
            username=payload.username,
            password=payload.password,
            theme=payload.theme,
            calorie_goal=payload.calorie_goal if payload.calorie_goal is not None else None,
            clear_calorie_goal=('calorie_goal' in payload.model_fields_set and payload.calorie_goal is None),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/{user_id}/change-password", response_model=UserResponse)
async def change_password(
    user_id: int,
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    try:
        user = await UserService.change_password(
            db, user_id, payload.current_password, payload.new_password
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}/family", response_model=UserResponse)
async def assign_family(
    user_id: int,
    payload: AssignFamilyRequest,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if payload.family_id is not None:
        family = await FamilyService.get_family_by_id(db, payload.family_id)
        if not family:
            raise HTTPException(status_code=404, detail="Family not found")

    user = await UserService.assign_family(db, user_id, payload.family_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")
    success = await UserService.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")


@router.patch("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: int,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await UserService.activate_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}/role", response_model=UserResponse)
async def change_role(
    user_id: int,
    payload: ChangeRoleRequest,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await UserService.change_role(db, user_id, payload.role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
