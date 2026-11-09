from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest
from app.security import (
	create_access_token,
	get_current_user,
	hash_password,
	require_admin,
	verify_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
DatabaseSession = Annotated[Session, Depends(get_db)]


def serialize_user(user: User) -> dict[str, object]:
	return {
		"id": user.id,
		"name": user.name,
		"email": user.email,
		"role": user.role,
		"created_at": user.created_at,
	}


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: DatabaseSession) -> dict[str, object]:
	normalized_email = payload.email.lower().strip()
	existing_user = db.query(User).filter(User.email == normalized_email).first()
	if existing_user:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="An account with this email already exists",
		)

	user = User(
		name=payload.name.strip(),
		email=normalized_email,
		password_hash=hash_password(payload.password),
		role=payload.role,
	)
	db.add(user)
	db.commit()
	db.refresh(user)
	return serialize_user(user)


@router.post("/login")
def login(payload: LoginRequest, db: DatabaseSession) -> dict[str, object]:
	email = payload.email.lower().strip()
	user = db.query(User).filter(User.email == email).first()
	if user is None or not verify_password(payload.password, user.password_hash):
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Email or password is incorrect",
			headers={"WWW-Authenticate": "Bearer"},
		)

	return {
		"access_token": create_access_token(str(user.id)),
		"token_type": "bearer",
		"user": serialize_user(user),
	}


@router.get("/me")
def get_profile(
	current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
	return serialize_user(current_user)


@router.get("/admin/overview")
def admin_overview(
	db: DatabaseSession,
	_admin: Annotated[User, Depends(require_admin)],
) -> dict[str, int]:
	role_counts = dict(
		db.query(User.role, func.count(User.id)).group_by(User.role).all()
	)
	return {
		"total_users": sum(role_counts.values()),
		"farmers": role_counts.get("farmer", 0),
		"consumers": role_counts.get("consumer", 0),
		"admins": role_counts.get("admin", 0),
	}


@router.get("/admin/users")
def list_users(
	db: DatabaseSession,
	_admin: Annotated[User, Depends(require_admin)],
) -> list[dict[str, object]]:
	users = db.query(User).order_by(User.created_at.desc(), User.id.desc()).all()
	return [serialize_user(user) for user in users]
