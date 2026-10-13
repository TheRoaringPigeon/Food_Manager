import pytest
from constants import API_CONTEXT_PATH


class TestIngredientCreation:
  """Tests for creating ingredients"""
  async def test_create_ingredient(self, auth_client, sample_ingredient_data):
    """Test creating a new ingredient"""
    response = await auth_client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json=sample_ingredient_data
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == sample_ingredient_data["name"]
    assert data["ingredient_type"] == sample_ingredient_data["ingredient_type"]
    assert "id" in data
    assert "created_at" in data

  async def test_create_ingredient_missing_required_fields(self, auth_client):
    """Test creating ingredient with missing required fields"""
    response = await auth_client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json={"name": "Incomplete Ingredient"}
    )
    assert response.status_code == 422

  async def test_create_ingredient_invalid_type(self, auth_client, sample_ingredient_data):
    """Test creating ingredient with invalid ingredient type"""
    sample_ingredient_data["ingredient_type"] = "invalid_type"
    response = await auth_client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json=sample_ingredient_data
    )
    assert response.status_code == 422


class TestIngredientRetrieval:
  """Tests for retrieving ingredients"""

  async def test_get_all_ingredients_empty(self, auth_client):
    """Test getting ingredients when database is empty"""
    response = await auth_client.get(f"{API_CONTEXT_PATH}/ingredients")
    assert response.status_code == 200
    assert response.json() == []

  async def test_get_all_ingredients(self, auth_client, sample_ingredient_data):
    """Test getting all ingredients"""
    await auth_client.post(f"{API_CONTEXT_PATH}/ingredients", json=sample_ingredient_data)

    response = await auth_client.get(f"{API_CONTEXT_PATH}/ingredients")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == sample_ingredient_data["name"]

  async def test_get_ingredient_by_id(self, auth_client, sample_ingredient_data):
    """Test getting a specific ingredient by ID"""
    create_response = await auth_client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json=sample_ingredient_data
    )
    ingredient_id = create_response.json()["id"]

    response = await auth_client.get(f"{API_CONTEXT_PATH}/ingredients/{ingredient_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == ingredient_id
    assert data["name"] == sample_ingredient_data["name"]

  async def test_get_nonexistent_ingredient(self, auth_client):
    """Test getting an ingredient that doesn't exist"""
    response = await auth_client.get(f"{API_CONTEXT_PATH}/ingredients/999")
    assert response.status_code == 404

  async def test_filter_by_ingredient_type(self, auth_client, sample_ingredient_data):
    """Test filtering ingredients by type"""
    # Create produce ingredient
    await auth_client.post(f"{API_CONTEXT_PATH}/ingredients", json=sample_ingredient_data)

    # Create spice ingredient
    spice = sample_ingredient_data.copy()
    spice["name"] = "Cinnamon"
    spice["ingredient_type"] = "spice"
    spice["ingredient_type"] = "produce"
    await auth_client.post(f"{API_CONTEXT_PATH}/ingredients", json=spice)

    # Filter for produce
    response = await auth_client.get(
        f"{API_CONTEXT_PATH}/ingredients",
        params={"ingredient_type": "produce"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["ingredient_type"] == "produce"

  async def test_search_ingredients(self, auth_client, sample_ingredient_data):
    """Test searching ingredients by name"""
    await auth_client.post(f"{API_CONTEXT_PATH}/ingredients", json=sample_ingredient_data)

    response = await auth_client.get(
        f"{API_CONTEXT_PATH}/ingredients",
        params={"search": "ground beef"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "ground beef" in data[0]["name"]


class TestIngredientUpdate:
  """Tests for updating ingredients"""

  async def test_update_ingredient(self, auth_client, sample_ingredient_data):
    """Test updating an ingredient"""
    create_response = await auth_client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json=sample_ingredient_data
    )
    ingredient_id = create_response.json()["id"]

    update_data = {"name": "Whole Wheat Flour"}
    response = await auth_client.put(
        f"{API_CONTEXT_PATH}/ingredients/{ingredient_id}",
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Whole Wheat Flour"

  async def test_update_nonexistent_ingredient(self, auth_client):
    """Test updating an ingredient that doesn't exist"""
    response = await auth_client.put(
        f"{API_CONTEXT_PATH}/ingredients/999",
        json={"name": "Updated"}
    )
    assert response.status_code == 404


class TestIngredientDelete:
  """Tests for deleting ingredients (admin only)"""

  async def test_delete_ingredient(self, admin_client, sample_ingredient_data):
    """Test deleting an ingredient as admin"""
    create_response = await admin_client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json=sample_ingredient_data
    )
    ingredient_id = create_response.json()["id"]

    response = await admin_client.delete(f"{API_CONTEXT_PATH}/ingredients/{ingredient_id}")
    assert response.status_code == 204

    get_response = await admin_client.get(f"{API_CONTEXT_PATH}/ingredients/{ingredient_id}")
    assert get_response.status_code == 404

  async def test_delete_nonexistent_ingredient(self, admin_client):
    """Test deleting an ingredient that doesn't exist"""
    response = await admin_client.delete(f"{API_CONTEXT_PATH}/ingredients/999")
    assert response.status_code == 404

  async def test_delete_ingredient_non_admin_forbidden(self, auth_client, sample_ingredient_data):
    """Test that non-admin cannot delete ingredients"""
    create_response = await auth_client.post(
        f"{API_CONTEXT_PATH}/ingredients",
        json=sample_ingredient_data
    )
    ingredient_id = create_response.json()["id"]
    response = await auth_client.delete(f"{API_CONTEXT_PATH}/ingredients/{ingredient_id}")
    assert response.status_code == 403


class TestIngredientCount:
  async def test_count_ingredients_empty(self, auth_client):
    response = await auth_client.get(f"{API_CONTEXT_PATH}/ingredients/count")
    assert response.status_code == 200
    assert response.json()["total"] == 0

  async def test_count_after_creation(self, auth_client, sample_ingredient_data):
    await auth_client.post(f"{API_CONTEXT_PATH}/ingredients", json=sample_ingredient_data)
    response = await auth_client.get(f"{API_CONTEXT_PATH}/ingredients/count")
    assert response.status_code == 200
    assert response.json()["total"] == 1


class TestIngredientMerge:
  async def test_merge_ingredients(self, admin_client, sample_ingredient_data):
    a = (await admin_client.post(f"{API_CONTEXT_PATH}/ingredients", json=sample_ingredient_data)).json()
    b_data = sample_ingredient_data.copy()
    b_data["name"] = "ground beef 80/20"
    b = (await admin_client.post(f"{API_CONTEXT_PATH}/ingredients", json=b_data)).json()

    response = await admin_client.post(f"{API_CONTEXT_PATH}/ingredients/merge", json={
        "keep_id": a["id"], "delete_id": b["id"]
    })
    assert response.status_code == 200
    assert response.json()["id"] == a["id"]

  async def test_merge_same_id_rejected(self, admin_client, sample_ingredient_data):
    a = (await admin_client.post(f"{API_CONTEXT_PATH}/ingredients", json=sample_ingredient_data)).json()
    response = await admin_client.post(f"{API_CONTEXT_PATH}/ingredients/merge", json={
        "keep_id": a["id"], "delete_id": a["id"]
    })
    assert response.status_code == 400

  async def test_merge_nonexistent_ingredient(self, admin_client, sample_ingredient_data):
    a = (await admin_client.post(f"{API_CONTEXT_PATH}/ingredients", json=sample_ingredient_data)).json()
    response = await admin_client.post(f"{API_CONTEXT_PATH}/ingredients/merge", json={
        "keep_id": a["id"], "delete_id": 99999
    })
    assert response.status_code == 404

