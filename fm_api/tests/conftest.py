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

from models import Base
from database import get_db
from main import app


# Use in-memory SQLite for isolated, fast tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
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


@pytest.fixture
async def client(setup_db):
  """Provide async HTTP client with test database"""
  async def override_get_db():
    async with TestingSessionLocal() as session:
      try:
        yield session
      finally:
        await session.close()

  app.dependency_overrides[get_db] = override_get_db

  async with AsyncClient(
      transport=ASGITransport(app=app),
      base_url="http://test"
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
      "quantity": 1,
      "unit": "pound",
      "tags": "",
      "image_url": "",
      "is_available": True,
  }
