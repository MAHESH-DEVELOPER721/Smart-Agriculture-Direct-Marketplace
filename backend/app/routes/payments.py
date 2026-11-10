from __future__ import annotations

from decimal import Decimal
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.notification import Notification
from app.models.order import Order
from app.models.payment import Payment
from app.models.refund import Refund
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentProcess, RefundCreate
from app.security import get_current_user, require_admin

router = APIRouter(prefix="/payments", tags=["Payments"])
api_router = APIRouter(prefix="/api/payments", tags=["Payments"])

PAYMENT_METHODS = {"upi", "debit_card", "credit_card", "net_banking", "cod"}
PAYMENT_STATUSES = {"pending", "processing", "succeeded", "failed", "cancelled"}


def normalize_method(method: str | None) -> str:
    if method is None:
        return "cod"
    translated = method.strip().lower().replace(" ", "_")
    return translated if translated in PAYMENT_METHODS else "cod"


def normalize_status(status: str | None) -> str:
    if status is None:
        return "pending"
    translated = status.strip().lower().replace(" ", "_")
    return translated if translated in PAYMENT_STATUSES else "pending"


def serialize_payment(payment: Payment) -> dict:
    return {
        "id": payment.id,
        "transaction_id": payment.transaction_id,
        "order_id": payment.order_id,
        "user_id": payment.user_id,
        "amount": float(payment.amount) if payment.amount is not None else 0.0,
        "payment_method": payment.payment_method,
        "payment_status": payment.payment_status,
        "gateway_payment_id": payment.gateway_payment_id,
        "gateway_order_id": payment.gateway_order_id,
        "created_at": payment.created_at.isoformat() if payment.created_at else None,
        "updated_at": payment.updated_at.isoformat() if payment.updated_at else None,
    }


def create_notification(
    db: Session,
    *,
    user_id: int,
    order_id: int | None = None,
    payment_id: int | None = None,
    notification_type: str,
    title: str,
    message: str,
) -> Notification:
    item = Notification(
        user_id=user_id,
        order_id=order_id,
        payment_id=payment_id,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def _resolve_order(db: Session, order_id: int | str | None, order_code: str | None) -> Order:
    if order_id is not None:
        if isinstance(order_id, int):
            order = db.query(Order).filter(Order.id == order_id).first()
            if order:
                return order
        order = db.query(Order).filter(Order.order_code == str(order_id)).first()
        if order:
            return order
    if order_code:
        order = db.query(Order).filter(Order.order_code == order_code).first()
        if order:
            return order
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")


def _check_payment_access(current_user: User, payment: Payment) -> None:
    if current_user.role == "admin":
        return
    if payment.user_id is not None and payment.user_id == current_user.id:
        return
    if payment.order_id is not None:
        order = payment.order
        if order is not None and order.user_id == current_user.id:
            return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this payment")


@router.post("/create", status_code=status.HTTP_201_CREATED)
@api_router.post("/create", status_code=status.HTTP_201_CREATED)
def create_payment(
    payload: PaymentCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    order = _resolve_order(db, payload.order_id, payload.order_code)
    if payload.payment_method:
        normalized_method = normalize_method(payload.payment_method)
    else:
        normalized_method = "cod"

    if normalized_method not in PAYMENT_METHODS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported payment method")

    amount = Decimal(str(payload.amount)) if payload.amount is not None else Decimal(str(order.total_amount))
    if amount <= Decimal("0"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment amount must be greater than zero")

    existing_payment = (
        db.query(Payment)
        .filter(Payment.order_id == order.id)
        .order_by(Payment.created_at.desc())
        .first()
    )
    if existing_payment:
        return serialize_payment(existing_payment)

    payment = Payment(
        transaction_id=f"TXN-{uuid4().hex[:12].upper()}",
        order_id=order.id,
        user_id=current_user.id,
        amount=amount,
        payment_method=normalized_method,
        payment_status="pending",
        gateway_order_id=f"ORD-{order.order_code}",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    create_notification(
        db,
        user_id=current_user.id,
        order_id=order.id,
        payment_id=payment.id,
        notification_type="payment_pending",
        title="Payment pending",
        message=f"Your payment for order {order.order_code} is being processed.",
    )
    return serialize_payment(payment)


@router.get("", response_model=list[dict])
@api_router.get("")
def list_payments(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    user_id: int | None = None,
    payment_status: str | None = Query(default=None),
) -> list[dict]:
    if current_user.role != "admin" and user_id is not None and user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access payments")

    query = db.query(Payment)
    if user_id is not None:
        query = query.filter(Payment.user_id == user_id)
    elif current_user.role != "admin":
        query = query.filter(Payment.user_id == current_user.id)
    if payment_status:
        query = query.filter(Payment.payment_status == normalize_status(payment_status))

    return [serialize_payment(payment) for payment in query.order_by(Payment.created_at.desc()).all()]


@router.get("/history")
@api_router.get("/history")
def payment_history(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    customer_id: int | None = Query(default=None),
    payment_status: str | None = Query(default=None),
) -> list[dict]:
    target_user_id = customer_id if customer_id is not None else current_user.id
    if current_user.role != "admin" and target_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access payment history")

    query = db.query(Payment).filter(Payment.user_id == target_user_id)
    if payment_status:
        query = query.filter(Payment.payment_status == normalize_status(payment_status))
    return [serialize_payment(payment) for payment in query.order_by(Payment.created_at.desc()).all()]


@router.get("/customer/{customer_id}")
@api_router.get("/customer/{customer_id}")
def payment_history_for_customer(
    customer_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[dict]:
    if current_user.role != "admin" and current_user.id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access customer payments")
    payments = (
        db.query(Payment)
        .filter(Payment.user_id == customer_id)
        .order_by(Payment.created_at.desc())
        .all()
    )
    return [serialize_payment(payment) for payment in payments]


@router.get("/{payment_id}")
@api_router.get("/{payment_id}")
def get_payment(
    payment_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    _check_payment_access(current_user, payment)
    return serialize_payment(payment)


@router.post("/{payment_id}/process", status_code=status.HTTP_200_OK)
@api_router.post("/{payment_id}/process", status_code=status.HTTP_200_OK)
def process_payment(
    payment_id: int,
    payload: PaymentProcess,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    if current_user.role != "admin" and payment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this payment")

    payment.payment_status = normalize_status(payload.payment_status)
    payment.gateway_payment_id = payload.gateway_payment_id or payment.gateway_payment_id or f"GW-{uuid4().hex[:10].upper()}"
    payment.gateway_order_id = payload.gateway_order_id or payment.gateway_order_id
    if payload.reason:
        payment.gateway_order_id = payment.gateway_order_id or f"ORD-{payment.order_id}"

    db.commit()
    db.refresh(payment)

    if payment.payment_status == "succeeded":
        create_notification(
            db,
            user_id=payment.user_id or current_user.id,
            order_id=payment.order_id,
            payment_id=payment.id,
            notification_type="payment_successful",
            title="Payment successful",
            message=f"Payment {payment.transaction_id} was successfully processed for order {payment.order_id}.",
        )
    elif payment.payment_status == "failed":
        create_notification(
            db,
            user_id=payment.user_id or current_user.id,
            order_id=payment.order_id,
            payment_id=payment.id,
            notification_type="payment_failed",
            title="Payment failed",
            message=f"Payment {payment.transaction_id} could not be completed. {payload.reason or 'Please try again.'}",
        )
    elif payment.payment_status == "cancelled":
        create_notification(
            db,
            user_id=payment.user_id or current_user.id,
            order_id=payment.order_id,
            payment_id=payment.id,
            notification_type="payment_failed",
            title="Payment cancelled",
            message=f"Payment {payment.transaction_id} was cancelled.",
        )

    return serialize_payment(payment)


@router.post("/{payment_id}/refund", status_code=status.HTTP_201_CREATED)
@api_router.post("/{payment_id}/refund", status_code=status.HTTP_201_CREATED)
def refund_payment(
    payment_id: int,
    payload: RefundCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    if current_user.role != "admin" and payment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to refund this payment")

    if payload.refund_amount > Decimal(str(payment.amount)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refund amount cannot exceed payment total")

    refund = Refund(
        payment_id=payment.id,
        refund_id=f"RFD-{uuid4().hex[:12].upper()}",
        refund_amount=payload.refund_amount,
        refund_status="requested",
        reason=payload.reason or "Customer refund request",
    )
    db.add(refund)
    db.commit()
    db.refresh(refund)

    create_notification(
        db,
        user_id=payment.user_id or current_user.id,
        order_id=payment.order_id,
        payment_id=payment.id,
        notification_type="refund_initiated",
        title="Refund initiated",
        message=f"A refund of {refund.refund_amount} has been requested for payment {payment.transaction_id}.",
    )
    return {
        "id": refund.id,
        "payment_id": refund.payment_id,
        "refund_id": refund.refund_id,
        "refund_amount": float(refund.refund_amount),
        "refund_status": refund.refund_status,
        "reason": refund.reason,
        "created_at": refund.created_at.isoformat() if refund.created_at else None,
    }


@router.get("/admin/all")
@api_router.get("/admin/all")
def admin_payments(
    db: Annotated[Session, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> list[dict]:
    return [serialize_payment(payment) for payment in db.query(Payment).order_by(Payment.created_at.desc()).all()]
