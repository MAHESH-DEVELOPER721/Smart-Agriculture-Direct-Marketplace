from decimal import Decimal

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func




class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        UniqueConstraint("transaction_id", name="uq_payments_transaction_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(80), unique=True, nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_method = Column(String(40), nullable=False, default="cod")
    payment_status = Column(String(40), nullable=False, default="pending", index=True)
    gateway_payment_id = Column(String(120), nullable=True)
    gateway_order_id = Column(String(120), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    order = relationship("Order", foreign_keys=[order_id])
    user = relationship("User", foreign_keys=[user_id])

    @property
    def amount_value(self) -> Decimal:
        return Decimal(str(self.amount)) if self.amount is not None else Decimal("0")
