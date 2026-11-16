
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.database import engine
from backend.main import app
from backend.models import Activity, Category

client = TestClient(app)


def test_categories_and_activities():
    with Session(engine) as db:
        category = Category(name="Тестовая категория")
        db.add(category)
        db.flush()

        activity = Activity(
            title="Тестовое мероприятие",
            description="Мероприятие для проверки API",
            category_id=category.id,
            location="Тестовый корпус",
        )
        db.add(activity)
        db.commit()
        category_id = category.id
        activity_id = activity.id

    try:
        response = client.get("/categories")
        assert response.status_code == 200
        assert any(
            item["id"] == category_id
            for item in response.json()
        )

        response = client.get(
            "/activities",
            params={"category_id": category_id},
        )
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["id"] == activity_id

        response = client.get(f"/activities/{activity_id}")
        assert response.status_code == 200
        assert response.json()["title"] == "Тестовое мероприятие"

        response = client.get("/activities/999999999")
        assert response.status_code == 404

    finally:
        with Session(engine) as db:
            activity = db.get(Activity, activity_id)
            if activity is not None:
                db.delete(activity)
                db.flush()

            category = db.get(Category, category_id)
            if category is not None:
                db.delete(category)

            db.commit()
