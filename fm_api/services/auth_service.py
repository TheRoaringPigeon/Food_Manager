import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from models.user import User
from utils.auth import verify_password, create_access_token
from utils.password_policy import MAX_AGE_DAYS


class AuthService:

    @staticmethod
    async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[User]:
        result = await db.execute(select(User).filter(User.username == username))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            return None
        if not await asyncio.to_thread(verify_password, password, user.hashed_password):
            return None

        expiry_cutoff = datetime.utcnow() - timedelta(days=MAX_AGE_DAYS)
        if not user.must_change_password:
            if user.password_changed_at is None or user.password_changed_at < expiry_cutoff:
                user.must_change_password = True
                await db.commit()

        return user

    @staticmethod
    def create_token_for_user(user: User) -> str:
        return create_access_token({
            "sub": user.username,
            "user_id": user.id,
            "role": user.role.value,
            "family_id": user.family_id,
        })
