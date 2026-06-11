from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models.user import UserRoleEnum


class UserResponse(BaseModel):
    id: int
    username: str
    role: UserRoleEnum
    family_id: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    role: Optional[UserRoleEnum] = UserRoleEnum.STANDARD


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AssignFamilyRequest(BaseModel):
    family_id: Optional[int] = None


class ChangeRoleRequest(BaseModel):
    role: UserRoleEnum


class UpdateUserPayload(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    password: Optional[str] = Field(None, min_length=6)
