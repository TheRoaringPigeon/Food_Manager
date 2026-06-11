from pydantic import BaseModel, Field
from datetime import datetime
from typing import List


class FamilyResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class FamilyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class FamilyUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class FamilyMember(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class FamilyWithMembersResponse(FamilyResponse):
    users: List[FamilyMember] = []
