from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from app.database import Base
from app.models.order import Order, OrderItem


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(80), nullable=False, default="Other")
    price = Column(Float, nullable=False)
    unit = Column(String(40), default="kg")
    stock = Column(Integer, default=0)
    farm_name = Column(String(150), nullable=False, default="Local Farm")
    description = Column(String(1000), default="")
    is_featured = Column(Boolean, default=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
