
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.orm import Session

from backend.auth import get_current_user, get_db
from backend.models import User, Category, UserInterest

router = APIRouter(prefix="/interests", tags=["Интересы"])


class InterestsRequest(BaseModel):
    category_ids: list[int]


@router.get("/")
def get_interests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    categories = db.scalars(
        select(Category)
        .join(UserInterest, Category.id == UserInterest.category_id)
        .where(UserInterest.user_id == current_user.id)
        .order_by(Category.id)
    ).all()

    return [
        {"id": category.id, "name": category.name}
        for category in categories
    ]


@router.put("/")
def update_interests(
    data: InterestsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    category_ids = set(data.category_ids)

    existing_categories = db.scalars(
        select(Category).where(Category.id.in_(category_ids))
    ).all()

    if len(existing_categories) != len(category_ids):
        raise HTTPException(
            status_code=400,
            detail="Одна или несколько категорий не найдены"
        )

    db.execute(
        delete(UserInterest).where(
            UserInterest.user_id == current_user.id
        )
    )

    for category_id in category_ids:
        db.add(
            UserInterest(
                user_id=current_user.id,
                category_id=category_id
            )
        )

    db.commit()

    return {
        "message": "Интересы успешно сохранены",
        "category_ids": sorted(category_ids)
    }
