from database import AsyncSessionLocal
from models.user import UserRoleEnum
from services.user_service import UserService
from services.family_service import FamilyService
from utils.logger import get_logger

logger = get_logger(__name__)


async def seed_defaults():
    async with AsyncSessionLocal() as db:
        family = await FamilyService.get_family_by_name(db, "default_family")
        if not family:
            family = await FamilyService.create_family(db, "default_family")
            logger.info("Seeded default_family")

        admin = await UserService.get_user_by_username(db, "Admin")
        if not admin:
            admin = await UserService.create_user(
                db,
                username="Admin",
                password="Admin@123",
                role=UserRoleEnum.ADMIN,
                must_change_password=True,
            )
            logger.info("Seeded Admin user")

        if admin.family_id != family.id:
            await UserService.assign_family(db, admin.id, family.id)
            logger.info(f"Assigned Admin to {family.name}")
