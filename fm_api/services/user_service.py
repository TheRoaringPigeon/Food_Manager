from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from models.user import User, UserRoleEnum
from utils.auth import hash_password


class UserService:

    @staticmethod
    async def create_user(
        db: AsyncSession,
        username: str,
        password: str,
        role: UserRoleEnum = UserRoleEnum.STANDARD,
        family_id: Optional[int] = None,
    ) -> User:
        user = User(
            username=username,
            hashed_password=hash_password(password),
            role=role,
            family_id=family_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_users(db: AsyncSession) -> List[User]:
        result = await db.execute(select(User).order_by(User.username))
        return result.scalars().all()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        result = await db.execute(select(User).filter(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
        result = await db.execute(select(User).filter(User.username == username))
        return result.scalar_one_or_none()

    @staticmethod
    async def assign_family(
        db: AsyncSession, user_id: int, family_id: Optional[int]
    ) -> Optional[User]:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return None
        user.family_id = family_id
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: int) -> bool:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return False
        await db.delete(user)
        await db.commit()
        return True

    @staticmethod
    async def change_role(
        db: AsyncSession, user_id: int, new_role: UserRoleEnum
    ) -> Optional[User]:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return None
        user.role = new_role
        await db.commit()
        await db.refresh(user)
        return user
