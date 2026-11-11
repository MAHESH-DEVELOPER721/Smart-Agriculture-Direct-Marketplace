from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict

PaymentMethod = Literal["upi", "debit_card", "credit_card", "net_banking", "cod"]
PaymentStatus = Literal["pending", "processing", "succeeded", "failed", "cancelled"]
NotificationType = Literal[
    "payment_successful",
    "payment_failed",
    "payment_pending",
    "order_confirmed",
    "order_shipped",
    "order_delivered",
    "refund_initiated",
    "refund_completed",
    "payment_reminder",
]


class PaymentCreate(BaseModel):
    order_id: int | str | None = None
    order_code: str | None = None
    amount: Decimal | None = None
    payment_method: str = Field(default="upi")


class PaymentProcess(BaseModel):
    payment_status: PaymentStatus = Field(default="succeeded")
    gateway_payment_id: str | None = None
    gateway_order_id: str | None = None
    reason: str | None = None


class RefundCreate(BaseModel):
    refund_amount: Decimal = Field(..., gt=0)
    reason: str | None = None


class NotificationFilter(BaseModel):
    notification_type: str | None = None


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    transaction_id: str
    order_id: int
    user_id: int | None = None
    amount: float
    payment_method: str
    payment_status: str
    gateway_payment_id: str | None = None
    gateway_order_id: str | None = None
    created_at: str | None = None
    updated_at: str | None = None


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    order_id: int | None = None
    payment_id: int | None = None
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: str | None = None
