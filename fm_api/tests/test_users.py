from constants import API_CONTEXT_PATH


class TestGetUsers:
    async def test_get_users_as_admin(self, admin_client):
        response = await admin_client.get(f"{API_CONTEXT_PATH}/users")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    async def test_get_users_as_standard_user(self, auth_client):
        response = await auth_client.get(f"{API_CONTEXT_PATH}/users")
        assert response.status_code == 403

    async def test_get_users_unauthenticated(self, client):
        response = await client.get(f"{API_CONTEXT_PATH}/users")
        assert response.status_code == 403


class TestCreateUser:
    async def test_create_user_as_admin(self, admin_client):
        response = await admin_client.post(f"{API_CONTEXT_PATH}/users", json={
            "username": "newmember", "password": "Member@1!", "role": "standard"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newmember"
        assert data["role"] == "standard"

    async def test_create_user_duplicate_username(self, admin_client):
        payload = {"username": "dupuser", "password": "Dup@1234!", "role": "standard"}
        await admin_client.post(f"{API_CONTEXT_PATH}/users", json=payload)
        response = await admin_client.post(f"{API_CONTEXT_PATH}/users", json=payload)
        assert response.status_code == 409

    async def test_create_user_weak_password(self, admin_client):
        # 8 chars (passes Pydantic) but no uppercase/digit/special → service returns 400
        response = await admin_client.post(f"{API_CONTEXT_PATH}/users", json={
            "username": "weakpass", "password": "weakpass", "role": "standard"
        })
        assert response.status_code == 400

    async def test_create_user_non_admin_forbidden(self, auth_client):
        response = await auth_client.post(f"{API_CONTEXT_PATH}/users", json={
            "username": "unauthorized", "password": "Unauth@1!", "role": "standard"
        })
        assert response.status_code == 403


class TestGetUserById:
    async def test_get_self(self, auth_client):
        me = (await auth_client.get(f"{API_CONTEXT_PATH}/auth/me")).json()
        response = await auth_client.get(f"{API_CONTEXT_PATH}/users/{me['id']}")
        assert response.status_code == 200
        assert response.json()["id"] == me["id"]

    async def test_get_other_user_as_non_admin(self, auth_client, admin_client):
        admin_me = (await admin_client.get(f"{API_CONTEXT_PATH}/auth/me")).json()
        response = await auth_client.get(f"{API_CONTEXT_PATH}/users/{admin_me['id']}")
        assert response.status_code == 403

    async def test_get_nonexistent_user(self, admin_client):
        response = await admin_client.get(f"{API_CONTEXT_PATH}/users/99999")
        assert response.status_code == 404


class TestUpdateUser:
    async def test_update_own_username(self, auth_client):
        me = (await auth_client.get(f"{API_CONTEXT_PATH}/auth/me")).json()
        response = await auth_client.patch(f"{API_CONTEXT_PATH}/users/{me['id']}", json={
            "username": "updateduser"
        })
        assert response.status_code == 200
        assert response.json()["username"] == "updateduser"

    async def test_update_own_calorie_goal(self, auth_client):
        me = (await auth_client.get(f"{API_CONTEXT_PATH}/auth/me")).json()
        response = await auth_client.patch(f"{API_CONTEXT_PATH}/users/{me['id']}", json={
            "calorie_goal": 2000
        })
        assert response.status_code == 200
        assert response.json()["calorie_goal"] == 2000

    async def test_update_other_user_as_non_admin(self, auth_client, admin_client):
        admin_me = (await admin_client.get(f"{API_CONTEXT_PATH}/auth/me")).json()
        response = await auth_client.patch(f"{API_CONTEXT_PATH}/users/{admin_me['id']}", json={
            "username": "hacked"
        })
        assert response.status_code == 403


class TestDeleteUser:
    async def test_delete_user_as_admin(self, admin_client):
        create = await admin_client.post(f"{API_CONTEXT_PATH}/users", json={
            "username": "todelete", "password": "Delete@1!", "role": "standard"
        })
        user_id = create.json()["id"]
        response = await admin_client.delete(f"{API_CONTEXT_PATH}/users/{user_id}")
        assert response.status_code == 204

    async def test_admin_cannot_delete_self(self, admin_client):
        me = (await admin_client.get(f"{API_CONTEXT_PATH}/auth/me")).json()
        response = await admin_client.delete(f"{API_CONTEXT_PATH}/users/{me['id']}")
        assert response.status_code == 400

    async def test_delete_nonexistent_user(self, admin_client):
        response = await admin_client.delete(f"{API_CONTEXT_PATH}/users/99999")
        assert response.status_code == 404


class TestChangePassword:
    async def test_change_own_password(self, auth_client):
        me = (await auth_client.get(f"{API_CONTEXT_PATH}/auth/me")).json()
        response = await auth_client.post(f"{API_CONTEXT_PATH}/users/{me['id']}/change-password", json={
            "current_password": "Test@1234!",
            "new_password": "NewTest@5678!"
        })
        assert response.status_code == 200

    async def test_change_password_wrong_current(self, auth_client):
        me = (await auth_client.get(f"{API_CONTEXT_PATH}/auth/me")).json()
        response = await auth_client.post(f"{API_CONTEXT_PATH}/users/{me['id']}/change-password", json={
            "current_password": "WrongPassword@1!",
            "new_password": "NewTest@5678!"
        })
        assert response.status_code == 400

    async def test_change_password_other_user_forbidden(self, auth_client, admin_client):
        admin_me = (await admin_client.get(f"{API_CONTEXT_PATH}/auth/me")).json()
        response = await auth_client.post(f"{API_CONTEXT_PATH}/users/{admin_me['id']}/change-password", json={
            "current_password": "Admin@1234!",
            "new_password": "NewAdmin@5678!"
        })
        assert response.status_code == 403


class TestAssignFamily:
    async def test_assign_family_to_user(self, admin_client):
        family = await admin_client.post(f"{API_CONTEXT_PATH}/families", json={"name": "Test Family"})
        family_id = family.json()["id"]

        user = await admin_client.post(f"{API_CONTEXT_PATH}/users", json={
            "username": "assigntest", "password": "Assign@1!", "role": "standard"
        })
        user_id = user.json()["id"]

        response = await admin_client.patch(f"{API_CONTEXT_PATH}/users/{user_id}/family", json={
            "family_id": family_id
        })
        assert response.status_code == 200
        assert response.json()["family_id"] == family_id

    async def test_assign_nonexistent_family(self, admin_client):
        user = await admin_client.post(f"{API_CONTEXT_PATH}/users", json={
            "username": "nofamily", "password": "NoFam@1!", "role": "standard"
        })
        user_id = user.json()["id"]

        response = await admin_client.patch(f"{API_CONTEXT_PATH}/users/{user_id}/family", json={
            "family_id": 99999
        })
        assert response.status_code == 404

    async def test_unassign_family(self, admin_client):
        user = await admin_client.post(f"{API_CONTEXT_PATH}/users", json={
            "username": "unassign", "password": "Unassign@1!", "role": "standard"
        })
        user_id = user.json()["id"]

        response = await admin_client.patch(f"{API_CONTEXT_PATH}/users/{user_id}/family", json={
            "family_id": None
        })
        assert response.status_code == 200
        assert response.json()["family_id"] is None


class TestActivateAndRole:
    async def test_activate_deleted_user(self, admin_client):
        create = await admin_client.post(f"{API_CONTEXT_PATH}/users", json={
            "username": "toactivate", "password": "Active@1!", "role": "standard"
        })
        user_id = create.json()["id"]
        await admin_client.delete(f"{API_CONTEXT_PATH}/users/{user_id}")

        response = await admin_client.patch(f"{API_CONTEXT_PATH}/users/{user_id}/activate")
        assert response.status_code == 200
        assert response.json()["is_active"] is True

    async def test_change_role_to_admin(self, admin_client):
        create = await admin_client.post(f"{API_CONTEXT_PATH}/users", json={
            "username": "promoted", "password": "Promo@1234!", "role": "standard"
        })
        user_id = create.json()["id"]
        response = await admin_client.patch(f"{API_CONTEXT_PATH}/users/{user_id}/role", json={
            "role": "admin"
        })
        assert response.status_code == 200
        assert response.json()["role"] == "admin"
