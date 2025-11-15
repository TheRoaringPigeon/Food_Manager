import pytest
from constants import API_CONTEXT_PATH


class TestRecipeCreation:
  """Tests for creating recipes"""

  def test_create_recipe(self, client, sample_recipe_data):
    """Test creating a new recipe"""
    response = client.post(
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

  def test_create_recipe_missing_required_fields(self, client):
    """Test creating recipe with missing required fields"""
    response = client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json={"name": "Incomplete Recipe"}
    )
    assert response.status_code == 422

  def test_create_recipe_invalid_type(self, client, sample_recipe_data):
    """Test creating recipe with invalid recipe type"""
    sample_recipe_data["recipe_type"] = "invalid_type"
    response = client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    assert response.status_code == 422


class TestRecipeRetrieval:
  """Tests for retrieving recipes"""

  def test_get_all_recipes_empty(self, client):
    """Test getting recipes when database is empty"""
    response = client.get(f"{API_CONTEXT_PATH}/recipes")
    assert response.status_code == 200
    assert response.json() == []

  def test_get_all_recipes(self, client, sample_recipe_data):
    """Test getting all recipes"""
    # Create a recipe first
    client.post(f"{API_CONTEXT_PATH}/recipes", json=sample_recipe_data)

    response = client.get(f"{API_CONTEXT_PATH}/recipes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == sample_recipe_data["name"]

  def test_get_recipe_by_id(self, client, sample_recipe_data):
    """Test getting a specific recipe by ID"""
    # Create a recipe
    create_response = client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    # Get the recipe
    response = client.get(f"{API_CONTEXT_PATH}/recipes/{recipe_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == recipe_id
    assert data["name"] == sample_recipe_data["name"]

  def test_get_nonexistent_recipe(self, client):
    """Test getting a recipe that doesn't exist"""
    response = client.get(f"{API_CONTEXT_PATH}/recipes/999")
    assert response.status_code == 404

  def test_filter_by_recipe_type(self, client, sample_recipe_data):
    """Test filtering recipes by type"""
    # Create breakfast recipe
    client.post(f"{API_CONTEXT_PATH}/recipes", json=sample_recipe_data)

    # Create lunch recipe
    lunch_recipe = sample_recipe_data.copy()
    lunch_recipe["name"] = "Sandwich"
    lunch_recipe["recipe_type"] = "lunch"
    client.post(f"{API_CONTEXT_PATH}/recipes", json=lunch_recipe)

    # Filter for breakfast
    response = client.get(
        f"{API_CONTEXT_PATH}/recipes",
        params={"recipe_type": "breakfast"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["recipe_type"] == "breakfast"

  def test_filter_by_favorites(self, client, sample_recipe_data):
    """Test filtering recipes by favorite status"""
    # Create a recipe
    create_response = client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    # Mark as favorite
    client.post(f"{API_CONTEXT_PATH}/recipes/{recipe_id}/favorite")

    # Filter for favorites
    response = client.get(
        f"{API_CONTEXT_PATH}/recipes",
        params={"is_favorite": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["is_favorite"] is True

  def test_search_recipes(self, client, sample_recipe_data):
    """Test searching recipes by name"""
    client.post(f"{API_CONTEXT_PATH}/recipes", json=sample_recipe_data)

    response = client.get(
        f"{API_CONTEXT_PATH}/recipes",
        params={"search": "Pancakes"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "Pancakes" in data[0]["name"]


class TestRecipeUpdate:
  """Tests for updating recipes"""

  def test_update_recipe(self, client, sample_recipe_data):
    """Test updating a recipe"""
    # Create a recipe
    create_response = client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    # Update the recipe
    update_data = {"name": "Super Fluffy Pancakes", "servings": 6}
    response = client.put(
        f"{API_CONTEXT_PATH}/recipes/{recipe_id}",
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Super Fluffy Pancakes"
    assert data["servings"] == 6
    # Original fields should remain
    assert data["recipe_type"] == "breakfast"

  def test_update_nonexistent_recipe(self, client):
    """Test updating a recipe that doesn't exist"""
    response = client.put(
        f"{API_CONTEXT_PATH}/recipes/999",
        json={"name": "Updated"}
    )
    assert response.status_code == 404


class TestRecipeDelete:
  """Tests for deleting recipes"""

  def test_delete_recipe(self, client, sample_recipe_data):
    """Test deleting a recipe"""
    # Create a recipe
    create_response = client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    # Delete the recipe
    response = client.delete(f"{API_CONTEXT_PATH}/recipes/{recipe_id}")
    assert response.status_code == 204

    # Verify it's deleted
    get_response = client.get(f"{API_CONTEXT_PATH}/recipes/{recipe_id}")
    assert get_response.status_code == 404

  def test_delete_nonexistent_recipe(self, client):
    """Test deleting a recipe that doesn't exist"""
    response = client.delete(f"{API_CONTEXT_PATH}/recipes/999")
    assert response.status_code == 404


class TestRecipeFavorites:
  """Tests for favorite functionality"""

  def test_toggle_favorite(self, client, sample_recipe_data):
    """Test toggling favorite status"""
    # Create a recipe
    create_response = client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    # Toggle to favorite
    response = client.post(f"{API_CONTEXT_PATH}/recipes/{recipe_id}/favorite")
    assert response.status_code == 200
    assert response.json()["is_favorite"] is True

    # Toggle back to not favorite
    response = client.post(f"{API_CONTEXT_PATH}/recipes/{recipe_id}/favorite")
    assert response.status_code == 200
    assert response.json()["is_favorite"] is False

  def test_toggle_favorite_nonexistent(self, client):
    """Test toggling favorite on nonexistent recipe"""
    response = client.post(f"{API_CONTEXT_PATH}/recipes/999/favorite")
    assert response.status_code == 404


class TestRecipeCooking:
  """Tests for cooking/last cooked functionality"""

  def test_mark_as_cooked(self, client, sample_recipe_data):
    """Test marking a recipe as cooked"""
    # Create a recipe
    create_response = client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]

    # Mark as cooked
    response = client.post(f"{API_CONTEXT_PATH}/recipes/{recipe_id}/cooked")
    assert response.status_code == 200
    data = response.json()
    assert data["last_cooked"] is not None

  def test_mark_as_cooked_nonexistent(self, client):
    """Test marking nonexistent recipe as cooked"""
    response = client.post(f"{API_CONTEXT_PATH}/recipes/999/cooked")
    assert response.status_code == 404

  def test_get_recently_cooked(self, client, sample_recipe_data):
    """Test getting recently cooked recipes"""
    # Create and mark a recipe as cooked
    create_response = client.post(
        f"{API_CONTEXT_PATH}/recipes",
        json=sample_recipe_data
    )
    recipe_id = create_response.json()["id"]
    client.post(f"{API_CONTEXT_PATH}/recipes/{recipe_id}/cooked")

    # Get recently cooked
    response = client.get(f"{API_CONTEXT_PATH}/recipes/recently-cooked")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == recipe_id
    assert data[0]["last_cooked"] is not None
