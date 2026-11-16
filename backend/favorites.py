
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.auth import get_current_user, get_db
from backend.models import User, Activity, Favorite

router = APIRouter(prefix="/favorites", tags=["Избранное"])


@router.get("/")
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activities = db.scalars(
        select(Activity)
        .join(Favorite, Favorite.activity_id == Activity.id)
        .where(Favorite.user_id == current_user.id)
        .order_by(Activity.id)
    ).all()

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


@router.post("/{activity_id}", status_code=201)
def add_favorite(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity = db.get(Activity, activity_id)

    if activity is None:
        raise HTTPException(
            status_code=404,
            detail="Активность не найдена"
        )

    existing = db.get(Favorite, (current_user.id, activity_id))

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Активность уже добавлена в избранное"
        )

    favorite = Favorite(
        user_id=current_user.id,
        activity_id=activity_id
    )

    db.add(favorite)
    db.commit()

    return {"message": "Активность добавлена в избранное"}


@router.delete("/{activity_id}")
def delete_favorite(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorite = db.get(Favorite, (current_user.id, activity_id))

    if favorite is None:
        raise HTTPException(
            status_code=404,
            detail="Активность отсутствует в избранном"
        )

    db.delete(favorite)
    db.commit()

    return {"message": "Активность удалена из избранного"}
