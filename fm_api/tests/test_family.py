from constants import API_CONTEXT_PATH


class TestGetFamilies:
    async def test_get_families_as_admin(self, admin_client):
        response = await admin_client.get(f"{API_CONTEXT_PATH}/families")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    async def test_get_families_non_admin(self, auth_client):
        response = await auth_client.get(f"{API_CONTEXT_PATH}/families")
        assert response.status_code == 403


class TestCreateFamily:
    async def test_create_family(self, admin_client):
        response = await admin_client.post(f"{API_CONTEXT_PATH}/families", json={"name": "Smith Family"})
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Smith Family"
        assert "id" in data

    async def test_create_duplicate_family(self, admin_client):
        await admin_client.post(f"{API_CONTEXT_PATH}/families", json={"name": "Jones Family"})
        response = await admin_client.post(f"{API_CONTEXT_PATH}/families", json={"name": "Jones Family"})
        assert response.status_code == 409

    async def test_create_family_non_admin(self, auth_client):
        response = await auth_client.post(f"{API_CONTEXT_PATH}/families", json={"name": "Unauthorized"})
        assert response.status_code == 403


class TestGetFamilyById:
    async def test_get_family_by_id(self, admin_client):
        create = await admin_client.post(f"{API_CONTEXT_PATH}/families", json={"name": "Brown Family"})
        family_id = create.json()["id"]

        response = await admin_client.get(f"{API_CONTEXT_PATH}/families/{family_id}")
        assert response.status_code == 200
        assert response.json()["id"] == family_id

    async def test_get_nonexistent_family(self, admin_client):
        response = await admin_client.get(f"{API_CONTEXT_PATH}/families/99999")
        assert response.status_code == 404


class TestRenameFamily:
    async def test_rename_family(self, admin_client):
        create = await admin_client.post(f"{API_CONTEXT_PATH}/families", json={"name": "Old Name"})
        family_id = create.json()["id"]

        response = await admin_client.patch(
            f"{API_CONTEXT_PATH}/families/{family_id}",
            json={"name": "New Name"}
        )
        assert response.status_code == 200
        assert response.json()["name"] == "New Name"

    async def test_rename_to_existing_name(self, admin_client):
        await admin_client.post(f"{API_CONTEXT_PATH}/families", json={"name": "Taken Name"})
        create2 = await admin_client.post(f"{API_CONTEXT_PATH}/families", json={"name": "My Family"})
        family_id = create2.json()["id"]

        response = await admin_client.patch(
            f"{API_CONTEXT_PATH}/families/{family_id}",
            json={"name": "Taken Name"}
        )
        assert response.status_code == 409

    async def test_rename_nonexistent_family(self, admin_client):
        response = await admin_client.patch(
            f"{API_CONTEXT_PATH}/families/99999",
            json={"name": "Ghost"}
        )
        assert response.status_code == 404


class TestDeleteFamily:
    async def test_delete_family(self, admin_client):
        create = await admin_client.post(f"{API_CONTEXT_PATH}/families", json={"name": "To Delete"})
        family_id = create.json()["id"]

        response = await admin_client.delete(f"{API_CONTEXT_PATH}/families/{family_id}")
        assert response.status_code == 204

        get_response = await admin_client.get(f"{API_CONTEXT_PATH}/families/{family_id}")
        assert get_response.status_code == 404

    async def test_delete_nonexistent_family(self, admin_client):
        response = await admin_client.delete(f"{API_CONTEXT_PATH}/families/99999")
        assert response.status_code == 404
