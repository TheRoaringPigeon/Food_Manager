import asyncio
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
            hashed_password=await asyncio.to_thread(hash_password, password),
            role=role,
            family_id=family_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_users(db: AsyncSession, include_inactive: bool = False) -> List[User]:
        q = select(User).order_by(User.username)
        if not include_inactive:
            q = q.filter(User.is_active == True)
        result = await db.execute(q)
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
        user.is_active = False
        await db.commit()
        return True

    @staticmethod
    async def update_user(
        db: AsyncSession,
        user_id: int,
        username: Optional[str] = None,
        password: Optional[str] = None,
        theme: Optional[str] = None,
    ) -> Optional[User]:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return None
        if username is not None:
            user.username = username
        if password is not None:
            user.hashed_password = await asyncio.to_thread(hash_password, password)
        if theme is not None:
            user.theme = theme
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def activate_user(db: AsyncSession, user_id: int) -> Optional[User]:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return None
        user.is_active = True
        await db.commit()
        await db.refresh(user)
        return user

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
