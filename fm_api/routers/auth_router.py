from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.user import LoginRequest, SignupRequest, TokenResponse, UserResponse
from services.auth_service import AuthService
from services.user_service import UserService
from models.user import UserRoleEnum
from dependencies.auth import get_current_user
from models.user import User
from constants import API_CONTEXT_PATH

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/auth",
    tags=["auth"],
)


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await AuthService.authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = AuthService.create_token_for_user(user)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    existing = await UserService.get_user_by_username(db, request.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )
    user = await UserService.create_user(
        db,
        username=request.username,
        password=request.password,
        role=UserRoleEnum.STANDARD,
    )
    token = AuthService.create_token_for_user(user)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
