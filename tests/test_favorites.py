
import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.database import engine
from backend.main import app
from backend.models import User, Category, Activity, Favorite

client = TestClient(app)


def test_favorites():
    email = f"favorite_{uuid.uuid4().hex}@example.com"
    password = "TestPassword123!"

    response = client.post(
        "/auth/register",
        json={"email": email, "password": password}
    )
    assert response.status_code == 201

    response = client.post(
        "/auth/login",
        json={"email": email, "password": password}
    )
    assert response.status_code == 200

    headers = {
        "Authorization": f"Bearer {response.json()['access_token']}"
    }

    with Session(engine) as db:
        category = Category(name=f"Тест {uuid.uuid4().hex[:8]}")
        db.add(category)
        db.flush()

        activity = Activity(
            title="Тестовая активность избранного",
            description="Проверка избранного",
            category_id=category.id,
            location="ЯГТУ"
        )
        db.add(activity)
        db.commit()

        category_id = category.id
        activity_id = activity.id

    try:
        response = client.post(
            f"/favorites/{activity_id}",
            headers=headers
        )
        assert response.status_code == 201

        response = client.get("/favorites/", headers=headers)
        assert response.status_code == 200
        assert any(
            item["id"] == activity_id
            for item in response.json()
        )

        response = client.post(
            f"/favorites/{activity_id}",
            headers=headers
        )
        assert response.status_code == 409

        response = client.delete(
            f"/favorites/{activity_id}",
            headers=headers
        )
        assert response.status_code == 200

        response = client.get("/favorites/", headers=headers)
        assert response.status_code == 200
        assert not any(
            item["id"] == activity_id
            for item in response.json()
        )

    finally:
        with Session(engine) as db:
            user = db.query(User).filter(User.email == email).first()

            if user:
                db.query(Favorite).filter(
                    Favorite.user_id == user.id
                ).delete()
                db.delete(user)

            activity = db.get(Activity, activity_id)
            if activity:
                db.delete(activity)

            category = db.get(Category, category_id)
            if category:
                db.delete(category)

            db.commit()
