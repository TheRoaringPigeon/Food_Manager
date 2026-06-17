import pytest
from constants import API_CONTEXT_PATH


class TestIngredientCreation:
  """Tests for creating ingredients"""
  async def test_create_ingredient(self, client, sample_ingredient_data):
    """Test creating a new ingredient"""
    response = await client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json=sample_ingredient_data
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == sample_ingredient_data["name"]
    assert data["ingredient_type"] == sample_ingredient_data["ingredient_type"]
    assert "id" in data
    assert "created_at" in data

  async def test_create_ingredient_missing_required_fields(self, client):
    """Test creating ingredient with missing required fields"""
    response = await client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json={"name": "Incomplete Ingredient"}
    )
    assert response.status_code == 422

  async def test_create_ingredient_invalid_type(self, client, sample_ingredient_data):
    """Test creating ingredient with invalid ingredient type"""
    sample_ingredient_data["ingredient_type"] = "invalid_type"
    response = await client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json=sample_ingredient_data
    )
    assert response.status_code == 422


class TestIngredientRetrieval:
  """Tests for retrieving ingredients"""

  async def test_get_all_ingredients_empty(self, client):
    """Test getting ingredients when database is empty"""
    response = await client.get(f"{API_CONTEXT_PATH}/ingredients")
    assert response.status_code == 200
    assert response.json() == []

  async def test_get_all_ingredients(self, client, sample_ingredient_data):
    """Test getting all ingredients"""
    await client.post(f"{API_CONTEXT_PATH}/ingredients", json=sample_ingredient_data)

    response = await client.get(f"{API_CONTEXT_PATH}/ingredients")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == sample_ingredient_data["name"]

  async def test_get_ingredient_by_id(self, client, sample_ingredient_data):
    """Test getting a specific ingredient by ID"""
    create_response = await client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json=sample_ingredient_data
    )
    ingredient_id = create_response.json()["id"]

    response = await client.get(f"{API_CONTEXT_PATH}/ingredients/{ingredient_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == ingredient_id
    assert data["name"] == sample_ingredient_data["name"]

  async def test_get_nonexistent_ingredient(self, client):
    """Test getting an ingredient that doesn't exist"""
    response = await client.get(f"{API_CONTEXT_PATH}/ingredients/999")
    assert response.status_code == 404

  async def test_filter_by_ingredient_type(self, client, sample_ingredient_data):
    """Test filtering ingredients by type"""
    # Create produce ingredient
    await client.post(f"{API_CONTEXT_PATH}/ingredients", json=sample_ingredient_data)

    # Create spice ingredient
    spice = sample_ingredient_data.copy()
    spice["name"] = "Cinnamon"
    spice["ingredient_type"] = "spice"
    spice["ingredient_type"] = "produce"
    await client.post(f"{API_CONTEXT_PATH}/ingredients", json=spice)

    # Filter for produce
    response = await client.get(
        f"{API_CONTEXT_PATH}/ingredients",
        params={"ingredient_type": "produce"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["ingredient_type"] == "produce"

  async def test_search_ingredients(self, client, sample_ingredient_data):
    """Test searching ingredients by name"""
    await client.post(f"{API_CONTEXT_PATH}/ingredients", json=sample_ingredient_data)

    response = await client.get(
        f"{API_CONTEXT_PATH}/ingredients",
        params={"search": "ground beef"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "ground beef" in data[0]["name"]


class TestIngredientUpdate:
  """Tests for updating ingredients"""

  async def test_update_ingredient(self, client, sample_ingredient_data):
    """Test updating an ingredient"""
    create_response = await client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json=sample_ingredient_data
    )
    ingredient_id = create_response.json()["id"]

    update_data = {"name": "Whole Wheat Flour"}
    response = await client.put(
        f"{API_CONTEXT_PATH}/ingredients/{ingredient_id}",
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Whole Wheat Flour"

  async def test_update_nonexistent_ingredient(self, client):
    """Test updating an ingredient that doesn't exist"""
    response = await client.put(
        f"{API_CONTEXT_PATH}/ingredients/999",
        json={"name": "Updated"}
    )
    assert response.status_code == 404


class TestIngredientDelete:
  """Tests for deleting ingredients"""

  async def test_delete_ingredient(self, client, sample_ingredient_data):
    """Test deleting an ingredient"""
    create_response = await client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json=sample_ingredient_data
    )
    ingredient_id = create_response.json()["id"]

    response = await client.delete(f"{API_CONTEXT_PATH}/ingredients/{ingredient_id}")
    assert response.status_code == 204

    get_response = await client.get(f"{API_CONTEXT_PATH}/ingredients/{ingredient_id}")
    assert get_response.status_code == 404

  async def test_delete_nonexistent_ingredient(self, client):
    """Test deleting an ingredient that doesn't exist"""
    response = await client.delete(f"{API_CONTEXT_PATH}/ingredients/999")
    assert response.status_code == 404


