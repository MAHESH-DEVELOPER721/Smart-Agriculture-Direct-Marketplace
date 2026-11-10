from decimal import Decimal

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.sql import func

from app.database import Base


class Refund(Base):
    __tablename__ = "refunds"
    __table_args__ = (
        UniqueConstraint("refund_id", name="uq_refunds_refund_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False, index=True)
    refund_id = Column(String(80), unique=True, nullable=False, index=True)
    refund_amount = Column(Numeric(12, 2), nullable=False)
    refund_status = Column(String(40), nullable=False, default="requested", index=True)
    reason = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    @property
    def amount_value(self) -> Decimal:
        return Decimal(str(self.refund_amount)) if self.refund_amount is not None else Decimal("0")
