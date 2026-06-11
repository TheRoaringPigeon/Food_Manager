from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from models.family import Family


class FamilyService:

    @staticmethod
    async def create_family(db: AsyncSession, name: str) -> Family:
        family = Family(name=name)
        db.add(family)
        await db.commit()
        await db.refresh(family)
        return family

    @staticmethod
    async def get_families(db: AsyncSession) -> List[Family]:
        result = await db.execute(select(Family).order_by(Family.name))
        return result.scalars().all()

    @staticmethod
    async def get_family_by_id(db: AsyncSession, family_id: int) -> Optional[Family]:
        result = await db.execute(select(Family).filter(Family.id == family_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_family_by_name(db: AsyncSession, name: str) -> Optional[Family]:
        result = await db.execute(select(Family).filter(Family.name == name))
        return result.scalar_one_or_none()
