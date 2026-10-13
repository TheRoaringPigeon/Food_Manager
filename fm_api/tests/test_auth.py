from constants import API_CONTEXT_PATH


class TestLogin:
    async def test_login_success(self, client):
        await client.post(f"{API_CONTEXT_PATH}/auth/signup", json={
            "username": "loginuser", "password": "Login@1234!"
        })
        response = await client.post(f"{API_CONTEXT_PATH}/auth/login", json={
            "username": "loginuser", "password": "Login@1234!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["username"] == "loginuser"

    async def test_login_wrong_password(self, client):
        await client.post(f"{API_CONTEXT_PATH}/auth/signup", json={
            "username": "badpassuser", "password": "Correct@1!"
        })
        response = await client.post(f"{API_CONTEXT_PATH}/auth/login", json={
            "username": "badpassuser", "password": "Wrong@999!"
        })
        assert response.status_code == 401

    async def test_login_nonexistent_user(self, client):
        response = await client.post(f"{API_CONTEXT_PATH}/auth/login", json={
            "username": "nobody", "password": "Nobody@1!"
        })
        assert response.status_code == 401


class TestSignup:
    async def test_signup_new_user(self, client):
        response = await client.post(f"{API_CONTEXT_PATH}/auth/signup", json={
            "username": "newuser", "password": "NewUser@1!"
        })
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["username"] == "newuser"
        assert data["user"]["role"] == "standard"

    async def test_signup_duplicate_username(self, client):
        payload = {"username": "dupuser", "password": "Dup@1234!"}
        await client.post(f"{API_CONTEXT_PATH}/auth/signup", json=payload)
        response = await client.post(f"{API_CONTEXT_PATH}/auth/signup", json=payload)
        assert response.status_code == 409

    async def test_signup_weak_password(self, client):
        # Passes Pydantic min_length=8 but fails strength check (no uppercase/digit/special)
        response = await client.post(f"{API_CONTEXT_PATH}/auth/signup", json={
            "username": "weakuser", "password": "weakpass"
        })
        assert response.status_code == 400


class TestMe:
    async def test_me_authenticated(self, auth_client):
        response = await auth_client.get(f"{API_CONTEXT_PATH}/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["role"] == "standard"

    async def test_me_unauthenticated(self, client):
        response = await client.get(f"{API_CONTEXT_PATH}/auth/me")
        assert response.status_code == 403
