import pytest
from constants import API_CONTEXT_PATH

FREEFORM_LOG = {
    "entry_type": "freeform",
    "food_name": "Apple",
    "calories": 95.0,
    "meal_type": "snack",
}


class TestCreateCalorieLog:
    async def test_create_freeform_log(self, auth_client):
        response = await auth_client.post(f"{API_CONTEXT_PATH}/calorie-logs", json=FREEFORM_LOG)
        assert response.status_code == 201
        data = response.json()
        assert data["food_name"] == "Apple"
        assert data["calories"] == 95.0
        assert data["entry_type"] == "freeform"
        assert data["meal_type"] == "snack"
        assert "id" in data

    async def test_create_log_invalid_meal_type(self, auth_client):
        response = await auth_client.post(f"{API_CONTEXT_PATH}/calorie-logs", json={
            **FREEFORM_LOG,
            "meal_type": "elevenses",
        })
        assert response.status_code == 422

    async def test_create_log_unauthenticated(self, client):
        response = await client.post(f"{API_CONTEXT_PATH}/calorie-logs", json=FREEFORM_LOG)
        assert response.status_code == 403

    async def test_create_breakfast_log(self, auth_client):
        response = await auth_client.post(f"{API_CONTEXT_PATH}/calorie-logs", json={
            "entry_type": "freeform",
            "food_name": "Oatmeal",
            "calories": 150.0,
            "meal_type": "breakfast",
        })
        assert response.status_code == 201
        assert response.json()["meal_type"] == "breakfast"


class TestGetTodayTotal:
    async def test_today_total_starts_at_zero(self, auth_client):
        response = await auth_client.get(f"{API_CONTEXT_PATH}/calorie-logs/today")
        assert response.status_code == 200
        assert response.json() == 0.0

    async def test_today_total_reflects_logged_entries(self, auth_client):
        await auth_client.post(f"{API_CONTEXT_PATH}/calorie-logs", json=FREEFORM_LOG)
        await auth_client.post(f"{API_CONTEXT_PATH}/calorie-logs", json={
            **FREEFORM_LOG, "food_name": "Banana", "calories": 89.0
        })
        response = await auth_client.get(f"{API_CONTEXT_PATH}/calorie-logs/today")
        assert response.status_code == 200
        assert response.json() == 184.0


class TestDailyHistory:
    # These endpoints use PostgreSQL-specific interval syntax incompatible with SQLite test DB.
    # They are verified by Cypress/integration tests against a real Postgres instance.

    @pytest.mark.skip(reason="Uses PostgreSQL interval syntax; requires real Postgres DB")
    async def test_history_empty(self, auth_client):
        response = await auth_client.get(f"{API_CONTEXT_PATH}/calorie-logs/history")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @pytest.mark.skip(reason="Uses PostgreSQL interval syntax; requires real Postgres DB")
    async def test_history_after_logging(self, auth_client):
        await auth_client.post(f"{API_CONTEXT_PATH}/calorie-logs", json=FREEFORM_LOG)
        response = await auth_client.get(f"{API_CONTEXT_PATH}/calorie-logs/history", params={"days": 1})
        assert response.status_code == 200
        data = response.json()
        totals = [d["total_calories"] for d in data]
        assert sum(totals) >= 95.0


class TestListLogs:
    async def test_list_empty(self, auth_client):
        response = await auth_client.get(f"{API_CONTEXT_PATH}/calorie-logs")
        assert response.status_code == 200
        assert response.json() == []

    async def test_list_returns_own_logs(self, auth_client):
        await auth_client.post(f"{API_CONTEXT_PATH}/calorie-logs", json=FREEFORM_LOG)
        response = await auth_client.get(f"{API_CONTEXT_PATH}/calorie-logs")
        assert response.status_code == 200
        assert len(response.json()) == 1

    async def test_list_pagination(self, auth_client):
        for i in range(5):
            await auth_client.post(f"{API_CONTEXT_PATH}/calorie-logs", json={
                **FREEFORM_LOG, "food_name": f"Food {i}"
            })
        response = await auth_client.get(
            f"{API_CONTEXT_PATH}/calorie-logs",
            params={"limit": 2, "skip": 0}
        )
        assert response.status_code == 200
        assert len(response.json()) == 2


class TestRecipeCalorieEstimate:
    async def test_estimate_nonexistent_recipe(self, auth_client):
        response = await auth_client.get(f"{API_CONTEXT_PATH}/calorie-logs/recipe/99999/estimate")
        assert response.status_code == 200
        data = response.json()
        assert data["is_estimate"] is False
        assert data["total_calories"] is None

    async def test_estimate_existing_recipe(self, auth_client, sample_recipe_data):
        recipe = await auth_client.post(f"{API_CONTEXT_PATH}/recipes", json=sample_recipe_data)
        recipe_id = recipe.json()["id"]
        response = await auth_client.get(f"{API_CONTEXT_PATH}/calorie-logs/recipe/{recipe_id}/estimate")
        assert response.status_code == 200
        assert "is_estimate" in response.json()


class TestDeleteLog:
    async def test_delete_log(self, auth_client):
        create = await auth_client.post(f"{API_CONTEXT_PATH}/calorie-logs", json=FREEFORM_LOG)
        log_id = create.json()["id"]
        response = await auth_client.delete(f"{API_CONTEXT_PATH}/calorie-logs/{log_id}")
        assert response.status_code == 204

        logs = (await auth_client.get(f"{API_CONTEXT_PATH}/calorie-logs")).json()
        assert all(l["id"] != log_id for l in logs)

    async def test_delete_nonexistent_log(self, auth_client):
        response = await auth_client.delete(f"{API_CONTEXT_PATH}/calorie-logs/99999")
        assert response.status_code == 404
