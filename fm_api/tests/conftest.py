from pathlib import Path
import sys
import os

try:
  sys.path.insert(0, str(Path(__file__).parent.parent))
  os.environ["APP_ENVIRONMENT"] = "production"
except Exception:
  pass

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from models import Base
from database import get_db
from main import app


# StaticPool ensures all sessions share the same in-memory SQLite connection
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    expire_on_commit=False,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
)


@pytest.fixture(scope="function")
async def setup_db():
  """Create fresh database tables for each test"""
  async with test_engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)
  yield
  async with test_engine.begin() as conn:
    await conn.run_sync(Base.metadata.drop_all)


def _make_db_override():
  async def override_get_db():
    async with TestingSessionLocal() as session:
      try:
        yield session
      finally:
        await session.close()
  return override_get_db


@pytest.fixture
async def client(setup_db):
  """Unauthenticated HTTP client with test database (for public routes)"""
  app.dependency_overrides[get_db] = _make_db_override()

  async with AsyncClient(
      transport=ASGITransport(app=app),
      base_url="http://test"
  ) as ac:
    yield ac

  app.dependency_overrides.clear()


@pytest.fixture
async def auth_client(setup_db):
  """Authenticated client as a standard user, assigned to a test family"""
  from services.user_service import UserService
  from services.family_service import FamilyService
  from utils.auth import create_access_token
  from models.user import UserRoleEnum

  app.dependency_overrides[get_db] = _make_db_override()

  async with TestingSessionLocal() as db:
    family = await FamilyService.create_family(db, "test_family")
    user = await UserService.create_user(
        db, username="testuser", password="Test@1234!", role=UserRoleEnum.STANDARD,
        family_id=family.id,
    )
    token = create_access_token({"user_id": user.id, "role": user.role.value})

  async with AsyncClient(
      transport=ASGITransport(app=app),
      base_url="http://test",
      headers={"Authorization": f"Bearer {token}"},
  ) as ac:
    yield ac

  app.dependency_overrides.clear()


@pytest.fixture
async def admin_client(setup_db):
  """Authenticated client as an admin user, assigned to a test family"""
  from services.user_service import UserService
  from services.family_service import FamilyService
  from utils.auth import create_access_token
  from models.user import UserRoleEnum

  app.dependency_overrides[get_db] = _make_db_override()

  async with TestingSessionLocal() as db:
    family = await FamilyService.create_family(db, "admin_family")
    user = await UserService.create_user(
        db, username="testadmin", password="Admin@1234!", role=UserRoleEnum.ADMIN,
        family_id=family.id,
    )
    token = create_access_token({"user_id": user.id, "role": user.role.value})

  async with AsyncClient(
      transport=ASGITransport(app=app),
      base_url="http://test",
      headers={"Authorization": f"Bearer {token}"},
  ) as ac:
    yield ac

  app.dependency_overrides.clear()


@pytest.fixture
def sample_recipe_data():
  """Sample recipe data for testing"""
  return {
      "name": "Pancakes",
      "description": "Fluffy breakfast pancakes",
      "ingredients": ["2 cups flour", "2 eggs", "1 cup milk", "2 tbsp sugar"],
      "instructions": ["Mix ingredients", "cook on griddle"],
      "prep_time": 10,
      "cook_time": 15,
      "servings": 4,
      "recipe_type": "breakfast",
      "tags": "quick,easy,breakfast"
  }


@pytest.fixture
def sample_ingredient_data():
  """Sample ingredient data for testing"""
  return {
      "name": "ground beef",
      "description": "low grade meat that always seems to go bad instantly",
      "ingredient_type": "meat",
      "tags": "",
      "image_url": "",
  }
