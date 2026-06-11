from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from models.user import User
from utils.auth import verify_password, create_access_token


class AuthService:

    @staticmethod
    async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[User]:
        result = await db.execute(select(User).filter(User.username == username))
        user = result.scalar_one_or_none()
        if not user or not user.is_active or not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_token_for_user(user: User) -> str:
        return create_access_token({
            "sub": user.username,
            "user_id": user.id,
            "role": user.role.value,
            "family_id": user.family_id,
        })
