from fastapi.middleware.cors import CORSMiddleware
from backend.favorites import router as favorites_router
from backend.recommendations import router as recommendations_router
from backend.interests import router as interests_router
from backend.auth import router as auth_router
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database import engine
from backend.models import Activity, Category

app = FastAPI(
    title="UniGuide API",
    description="API сервиса университетских активностей",
    version="0.1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(auth_router)
app.include_router(interests_router)
app.include_router(recommendations_router)
app.include_router(favorites_router)

def get_db():
    with Session(engine) as session:
        yield session


@app.get("/")
def home():
    return {"message": "UniGuide API работает"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.scalars(
        select(Category).order_by(Category.id)
    ).all()

    return [
        {"id": category.id, "name": category.name}
        for category in categories
    ]


@app.get("/activities")
def get_activities(
    category_id: int | None = None,
    db: Session = Depends(get_db)
):
    query = select(Activity).order_by(Activity.id)

    if category_id is not None:
        query = query.where(Activity.category_id == category_id)

    activities = db.scalars(query).all()

    return [
        {
            "id": activity.id,
            "title": activity.title,
            "description": activity.description,
            "category_id": activity.category_id,
            "location": activity.location,
            "event_date": activity.event_date,
            "participation_info": activity.participation_info,
            "registration_url": activity.registration_url
        }
        for activity in activities
    ]


@app.get("/activities/{activity_id}")
def get_activity(
    activity_id: int,
    db: Session = Depends(get_db)
):
    activity = db.get(Activity, activity_id)

    if activity is None:
        raise HTTPException(
            status_code=404,
            detail="Активность не найдена"
        )

    return {
        "id": activity.id,
        "title": activity.title,
        "description": activity.description,
        "category_id": activity.category_id,
        "location": activity.location,
        "event_date": activity.event_date,
        "participation_info": activity.participation_info,
        "registration_url": activity.registration_url
    }
