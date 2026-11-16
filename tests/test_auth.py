
import uuid

from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_registration_and_login():
    email = f"test_{uuid.uuid4().hex[:12]}@example.com"
    password = "TestPassword123!"

    response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password
        }
    )

    assert response.status_code == 201
    assert response.json()["email"] == email

    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password
        }
    )

    assert response.status_code == 200

    token = response.json()["access_token"]
    assert token

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json()["email"] == email


def test_invalid_login():
    response = client.post(
        "/auth/login",
        json={
            "email": "unknown_user@example.com",
            "password": "WrongPassword123!"
        }
    )

    assert response.status_code == 401
