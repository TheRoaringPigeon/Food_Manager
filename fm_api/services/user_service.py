import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from models.user import User, UserRoleEnum
from models.password_history import PasswordHistory
from utils.auth import hash_password, verify_password
from utils.password_policy import validate_password_strength, HISTORY_LIMIT


class UserService:

    @staticmethod
    async def _check_password_not_reused(
        db: AsyncSession, user_id: int, new_password: str, current_hash: str
    ) -> None:
        if await asyncio.to_thread(verify_password, new_password, current_hash):
            raise ValueError("New password must be different from your current password")

        result = await db.execute(
            select(PasswordHistory)
            .filter(PasswordHistory.user_id == user_id)
            .order_by(PasswordHistory.created_at.desc())
            .limit(HISTORY_LIMIT)
        )
        for entry in result.scalars().all():
            if await asyncio.to_thread(verify_password, new_password, entry.hashed_password):
                raise ValueError(f"Password cannot be one of the last {HISTORY_LIMIT} passwords used")

    @staticmethod
    async def create_user(
        db: AsyncSession,
        username: str,
        password: str,
        role: UserRoleEnum = UserRoleEnum.STANDARD,
        family_id: Optional[int] = None,
        must_change_password: bool = False,
    ) -> User:
        validate_password_strength(password)
        hashed = await asyncio.to_thread(hash_password, password)
        user = User(
            username=username,
            hashed_password=hashed,
            role=role,
            family_id=family_id,
            password_changed_at=datetime.utcnow(),
            must_change_password=must_change_password,
        )
        db.add(user)
        await db.flush()
        db.add(PasswordHistory(user_id=user.id, hashed_password=hashed))
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
            validate_password_strength(password)
            await UserService._check_password_not_reused(db, user_id, password, user.hashed_password)
            new_hash = await asyncio.to_thread(hash_password, password)
            db.add(PasswordHistory(user_id=user_id, hashed_password=new_hash))
            user.hashed_password = new_hash
            user.password_changed_at = datetime.utcnow()
            user.must_change_password = False
        if theme is not None:
            user.theme = theme
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def change_password(
        db: AsyncSession,
        user_id: int,
        current_password: str,
        new_password: str,
    ) -> Optional[User]:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return None
        if not await asyncio.to_thread(verify_password, current_password, user.hashed_password):
            raise ValueError("Current password is incorrect")
        validate_password_strength(new_password)
        await UserService._check_password_not_reused(db, user_id, new_password, user.hashed_password)
        new_hash = await asyncio.to_thread(hash_password, new_password)
        db.add(PasswordHistory(user_id=user_id, hashed_password=new_hash))
        user.hashed_password = new_hash
        user.password_changed_at = datetime.utcnow()
        user.must_change_password = False
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
