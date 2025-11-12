import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app
from database import get_db
from models.recipe import Base

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
  """Create a fresh database session for each test"""
  Base.metadata.create_all(bind=engine)
  session = TestingSessionLocal()
  try:
    yield session
  finally:
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
  """Create a test client with overridden database dependency"""
  def override_get_db():
    try:
      yield db_session
    finally:
      pass

  app.dependency_overrides[get_db] = override_get_db
  with TestClient(app) as test_client:
    yield test_client
  app.dependency_overrides.clear()


@pytest.fixture
def sample_recipe_data():
  """Sample recipe data for testing"""
  return {
      "name": "Pancakes",
      "description": "Fluffy breakfast pancakes",
      "ingredients": "2 cups flour, 2 eggs, 1 cup milk, 2 tbsp sugar",
      "instructions": "Mix ingredients and cook on griddle",
      "prep_time": 10,
      "cook_time": 15,
      "servings": 4,
      "recipe_type": "breakfast",
      "tags": "quick,easy,breakfast"
  }
