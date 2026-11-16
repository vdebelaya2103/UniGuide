
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.auth import get_current_user, get_db
from backend.models import Activity, User, UserInterest

router = APIRouter(
    prefix="/recommendations",
    tags=["Рекомендации"]
)


@router.get("/")
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interests_query = select(
        UserInterest.category_id
    ).where(
        UserInterest.user_id == current_user.id
    )

    activities = db.scalars(
        select(Activity)
        .where(Activity.category_id.in_(interests_query))
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
