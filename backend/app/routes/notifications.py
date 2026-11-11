from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.security import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])
api_router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


def normalize_notification_type(notification_type: str | None) -> str | None:
    if not notification_type:
        return None
    return notification_type.strip().lower().replace(" ", "_")


def serialize_notification(notification: Notification) -> dict:
    return {
        "id": notification.id,
        "user_id": notification.user_id,
        "order_id": notification.order_id,
        "payment_id": notification.payment_id,
        "title": notification.title,
        "message": notification.message,
        "notification_type": notification.notification_type,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat() if notification.created_at else None,
    }


@router.get("")
@api_router.get("")
def list_notifications(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    notification_type: str | None = Query(default=None),
    unread_only: bool = Query(default=False),
    user_id: int | None = Query(default=None),
) -> list[dict]:
    target_user_id = user_id if user_id is not None else current_user.id
    if current_user.role != "admin" and target_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access notifications")

    query = db.query(Notification).filter(Notification.user_id == target_user_id)
    normalized_type = normalize_notification_type(notification_type)
    if normalized_type:
        query = query.filter(Notification.notification_type == normalized_type)
    if unread_only:
        query = query.filter(Notification.is_read.is_(False))

    return [serialize_notification(item) for item in query.order_by(Notification.created_at.desc()).all()]


@router.get("/unread-count")
@api_router.get("/unread-count")
def unread_notification_count(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    count = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .filter(Notification.is_read.is_(False))
        .count()
    )
    return {"unread_count": count}


@router.post("/{notification_id}/read", status_code=status.HTTP_200_OK)
@api_router.post("/{notification_id}/read", status_code=status.HTTP_200_OK)
def mark_notification_read(
    notification_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    if current_user.role != "admin" and notification.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this notification")

    notification.is_read = True
    db.commit()
    return serialize_notification(notification)


@router.post("/read-all", status_code=status.HTTP_200_OK)
@api_router.post("/read-all", status_code=status.HTTP_200_OK)
def mark_all_notifications_read(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    updated = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .filter(Notification.is_read.is_(False))
        .update({"is_read": True}, synchronize_session=False)
    )
    db.commit()
    return {"updated": updated, "status": "success"}


@router.get("/filter")
@api_router.get("/filter")
def filter_notifications(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    notification_type: str = Query(...),
) -> list[dict]:
    normalized_type = normalize_notification_type(notification_type)
    if normalized_type is None:
        return []
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .filter(Notification.notification_type == normalized_type)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return [serialize_notification(item) for item in notifications]
