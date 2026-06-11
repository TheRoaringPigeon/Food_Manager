from pydantic import BaseModel, Field
from datetime import datetime


class FamilyResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class FamilyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
