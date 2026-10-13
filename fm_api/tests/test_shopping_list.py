from constants import API_CONTEXT_PATH


class TestShoppingList:
    async def test_generate_empty_list(self, auth_client):
        response = await auth_client.post(
            f"{API_CONTEXT_PATH}/shopping-list/generate",
            json={"recipe_ids": [], "ingredient_ids": []}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["needed"] == []
        assert data["unlinked"] == []

    async def test_generate_with_ingredient(self, auth_client):
        create = await auth_client.post(f"{API_CONTEXT_PATH}/ingredients", json={
            "name": "flour",
            "ingredient_type": "produce",
            "tags": "",
            "image_url": "",
        })
        ingredient_id = create.json()["id"]

        response = await auth_client.post(
            f"{API_CONTEXT_PATH}/shopping-list/generate",
            json={"recipe_ids": [], "ingredient_ids": [ingredient_id]}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["needed"]) == 1
        assert data["needed"][0]["name"] == "flour"
        assert data["needed"][0]["ingredient_id"] == ingredient_id

    async def test_generate_with_recipe(self, auth_client, sample_recipe_data):
        recipe = await auth_client.post(
            f"{API_CONTEXT_PATH}/recipes",
            json=sample_recipe_data
        )
        recipe_id = recipe.json()["id"]

        response = await auth_client.post(
            f"{API_CONTEXT_PATH}/shopping-list/generate",
            json={"recipe_ids": [recipe_id], "ingredient_ids": []}
        )
        assert response.status_code == 200
        data = response.json()
        assert "needed" in data
        assert "unlinked" in data

    async def test_generate_unauthenticated(self, client):
        response = await client.post(
            f"{API_CONTEXT_PATH}/shopping-list/generate",
            json={"recipe_ids": [], "ingredient_ids": []}
        )
        assert response.status_code == 403

    async def test_generate_nonexistent_ingredient_ignored(self, auth_client):
        response = await auth_client.post(
            f"{API_CONTEXT_PATH}/shopping-list/generate",
            json={"recipe_ids": [], "ingredient_ids": [99999]}
        )
        assert response.status_code == 200
        assert response.json()["needed"] == []
