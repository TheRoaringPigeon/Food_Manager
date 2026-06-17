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
    theme: str = 'indigo'
    must_change_password: bool = False
    calorie_goal: Optional[int] = None
    password_changed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    role: Optional[UserRoleEnum] = UserRoleEnum.STANDARD


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)


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
    password: Optional[str] = Field(None, min_length=8)
    theme: Optional[str] = Field(None, max_length=50)
    calorie_goal: Optional[int] = Field(None, gt=0)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
