import pytest


def test_register_user_success(client):
    payload = {
        "email": "newuser@example.com",
        "password": "StrongPassword123!",
        "full_name": "New User",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "StrongPassword123!",
        "full_name": "Duplicate User",
    }
    response1 = client.post("/api/v1/auth/register", json=payload)
    assert response1.status_code == 201

    response2 = client.post("/api/v1/auth/register", json=payload)
    assert response2.status_code == 400
    assert "already exists" in response2.json()["detail"]


def test_register_short_password(client):
    payload = {
        "email": "shortpass@example.com",
        "password": "123",
        "full_name": "Short Pass",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_login_json_success(client):
    payload = {
        "email": "login_user@example.com",
        "password": "MySecretPassword123!",
        "full_name": "Login User",
    }
    client.post("/api/v1/auth/register", json=payload)

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "login_user@example.com", "password": "MySecretPassword123!"},
    )
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_form_success(client):
    payload = {
        "email": "form_user@example.com",
        "password": "MySecretPassword123!",
        "full_name": "Form User",
    }
    client.post("/api/v1/auth/register", json=payload)

    login_resp = client.post(
        "/api/v1/auth/login/form",
        data={"username": "form_user@example.com", "password": "MySecretPassword123!"},
    )
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_invalid_credentials(client):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "WrongPassword!"},
    )
    assert login_resp.status_code == 401


def test_refresh_token_success(client):
    payload = {
        "email": "refresh_user@example.com",
        "password": "MySecretPassword123!",
        "full_name": "Refresh User",
    }
    reg_resp = client.post("/api/v1/auth/register", json=payload)
    refresh_token = reg_resp.json()["refresh_token"]

    resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_refresh_token_invalid(client):
    resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "invalid_jwt_token_string"},
    )
    assert resp.status_code == 401


def test_get_current_user_profile(client, auth_headers):
    resp = client.get("/api/v1/users/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "primary_user@example.com"
    assert data["full_name"] == "Primary User"
    assert data["is_active"] is True
    assert "password_hash" not in data  # Ensure security requirement: never expose password hash


def test_unauthorized_request(client):
    resp = client.get("/api/v1/users/me")
    assert resp.status_code == 401


def test_logout(client, auth_headers):
    resp = client.post("/api/v1/auth/logout", headers=auth_headers)
    assert resp.status_code == 200
    assert "Successfully logged out" in resp.json()["message"]

