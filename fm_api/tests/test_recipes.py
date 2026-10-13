from constants import API_CONTEXT_PATH


class TestRecipeCreation:
  """Tests for creating recipes"""

  async def test_create_recipe(self, auth_client, sample_recipe_data):
    """Test creating a new recipe"""
    response = await auth_client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == sample_recipe_data["name"]
    assert data["recipe_type"] == sample_recipe_data["recipe_type"]
    assert data["is_favorite"] is False
    assert "id" in data
    assert "created_at" in data

  async def test_create_recipe_missing_required_fields(self, auth_client):
    """Test creating recipe with missing required fields"""
    response = await auth_client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json={"name": "Incomplete Recipe"}
    )
    assert response.status_code == 422

  async def test_create_recipe_invalid_type(self, auth_client, sample_recipe_data):
    """Test creating recipe with invalid recipe type"""
    sample_recipe_data["recipe_type"] = "invalid_type"
    response = await auth_client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    assert response.status_code == 422

  async def test_create_recipe_unauthenticated(self, client, sample_recipe_data):
    """Test that creating a recipe without auth returns 403"""
    response = await client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    assert response.status_code == 403


class TestRecipeRetrieval:
  """Tests for retrieving recipes"""

  async def test_get_all_recipes_empty(self, auth_client):
    """Test getting recipes when database is empty"""
    response = await auth_client.get(f"{API_CONTEXT_PATH}/recipes")
    assert response.status_code == 200
    assert response.json() == []

  async def test_get_all_recipes(self, auth_client, sample_recipe_data):
    """Test getting all recipes"""
    await auth_client.post(f"{API_CONTEXT_PATH}/recipes", json=sample_recipe_data)

    response = await auth_client.get(f"{API_CONTEXT_PATH}/recipes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == sample_recipe_data["name"]

  async def test_get_recipe_by_id(self, auth_client, sample_recipe_data):
    """Test getting a specific recipe by ID"""
    create_response = await auth_client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    response = await auth_client.get(f"{API_CONTEXT_PATH}/recipes/{recipe_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == recipe_id
    assert data["name"] == sample_recipe_data["name"]

  async def test_get_nonexistent_recipe(self, auth_client):
    """Test getting a recipe that doesn't exist"""
    response = await auth_client.get(f"{API_CONTEXT_PATH}/recipes/999")
    assert response.status_code == 404

  async def test_filter_by_recipe_type(self, auth_client, sample_recipe_data):
    """Test filtering recipes by type"""
    await auth_client.post(f"{API_CONTEXT_PATH}/recipes", json=sample_recipe_data)

    lunch_recipe = sample_recipe_data.copy()
    lunch_recipe["name"] = "Sandwich"
    lunch_recipe["recipe_type"] = "lunch"
    await auth_client.post(f"{API_CONTEXT_PATH}/recipes", json=lunch_recipe)

    response = await auth_client.get(
        f"{API_CONTEXT_PATH}/recipes",
        params={"recipe_type": "breakfast"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["recipe_type"] == "breakfast"

  async def test_filter_by_favorites(self, auth_client, sample_recipe_data):
    """Test filtering recipes by favorite status"""
    create_response = await auth_client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    await auth_client.post(f"{API_CONTEXT_PATH}/recipes/{recipe_id}/favorite")

    response = await auth_client.get(
        f"{API_CONTEXT_PATH}/recipes",
        params={"is_favorite": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["is_favorite"] is True

  async def test_search_recipes(self, auth_client, sample_recipe_data):
    """Test searching recipes by name"""
    await auth_client.post(f"{API_CONTEXT_PATH}/recipes", json=sample_recipe_data)

    response = await auth_client.get(
        f"{API_CONTEXT_PATH}/recipes",
        params={"search": "Pancakes"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "Pancakes" in data[0]["name"]


class TestRecipeUpdate:
  """Tests for updating recipes"""

  async def test_update_recipe(self, auth_client, sample_recipe_data):
    """Test updating a recipe"""
    create_response = await auth_client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    update_data = {"name": "Super Fluffy Pancakes", "servings": 6}
    response = await auth_client.put(
        f"{API_CONTEXT_PATH}/recipes/{recipe_id}",
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Super Fluffy Pancakes"
    assert data["servings"] == 6
    assert data["recipe_type"] == "breakfast"

  async def test_update_nonexistent_recipe(self, auth_client):
    """Test updating a recipe that doesn't exist"""
    response = await auth_client.put(
        f"{API_CONTEXT_PATH}/recipes/999",
        json={"name": "Updated"}
    )
    assert response.status_code == 404


class TestRecipeDelete:
  """Tests for deleting recipes (admin only)"""

  async def test_delete_recipe(self, admin_client, sample_recipe_data):
    """Test deleting a recipe as admin"""
    create_response = await admin_client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    response = await admin_client.delete(f"{API_CONTEXT_PATH}/recipes/{recipe_id}")
    assert response.status_code == 204

    get_response = await admin_client.get(f"{API_CONTEXT_PATH}/recipes/{recipe_id}")
    assert get_response.status_code == 404

  async def test_delete_nonexistent_recipe(self, admin_client):
    """Test deleting a recipe that doesn't exist"""
    response = await admin_client.delete(f"{API_CONTEXT_PATH}/recipes/999")
    assert response.status_code == 404

  async def test_delete_recipe_non_admin_forbidden(self, auth_client, sample_recipe_data):
    """Test that non-admin cannot delete recipes"""
    create_response = await auth_client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]
    response = await auth_client.delete(f"{API_CONTEXT_PATH}/recipes/{recipe_id}")
    assert response.status_code == 403


class TestRecipeFavorites:
  """Tests for favorite functionality"""

  async def test_toggle_favorite(self, auth_client, sample_recipe_data):
    """Test toggling favorite status"""
    create_response = await auth_client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    response = await auth_client.post(f"{API_CONTEXT_PATH}/recipes/{recipe_id}/favorite")
    assert response.status_code == 200
    assert response.json()["is_favorite"] is True

    response = await auth_client.post(f"{API_CONTEXT_PATH}/recipes/{recipe_id}/favorite")
    assert response.status_code == 200
    assert response.json()["is_favorite"] is False

  async def test_toggle_favorite_nonexistent(self, auth_client):
    """Test toggling favorite on nonexistent recipe"""
    response = await auth_client.post(f"{API_CONTEXT_PATH}/recipes/999/favorite")
    assert response.status_code == 404


class TestRecipeCooking:
  """Tests for cooking/last cooked functionality"""

  async def test_mark_as_cooked(self, auth_client, sample_recipe_data):
    """Test marking a recipe as cooked"""
    create_response = await auth_client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    response = await auth_client.post(f"{API_CONTEXT_PATH}/recipes/{recipe_id}/cooked")
    assert response.status_code == 200
    data = response.json()
    assert data["last_cooked"] is not None

  async def test_mark_as_cooked_nonexistent(self, auth_client):
    """Test marking nonexistent recipe as cooked"""
    response = await auth_client.post(f"{API_CONTEXT_PATH}/recipes/999/cooked")
    assert response.status_code == 404

  async def test_get_recently_cooked(self, auth_client, sample_recipe_data):
    """Test getting recently cooked recipes"""
    create_response = await auth_client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]
    await auth_client.post(f"{API_CONTEXT_PATH}/recipes/{recipe_id}/cooked")

    response = await auth_client.get(f"{API_CONTEXT_PATH}/recipes/recently-cooked")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == recipe_id
    assert data[0]["last_cooked"] is not None


class TestRecipeCount:
  async def test_count_recipes_empty(self, auth_client):
    response = await auth_client.get(f"{API_CONTEXT_PATH}/recipes/count")
    assert response.status_code == 200
    assert response.json()["total"] == 0

  async def test_count_recipes_after_creation(self, auth_client, sample_recipe_data):
    await auth_client.post(f"{API_CONTEXT_PATH}/recipes", json=sample_recipe_data)
    response = await auth_client.get(f"{API_CONTEXT_PATH}/recipes/count")
    assert response.status_code == 200
    assert response.json()["total"] == 1

  async def test_count_recipes_filtered_by_type(self, auth_client, sample_recipe_data):
    await auth_client.post(f"{API_CONTEXT_PATH}/recipes", json=sample_recipe_data)
    response = await auth_client.get(
        f"{API_CONTEXT_PATH}/recipes/count",
        params={"recipe_type": "breakfast"}
    )
    assert response.status_code == 200
    assert response.json()["total"] == 1
