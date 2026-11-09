from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(60), nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String(40), default="kg")
    stock = Column(Integer, default=0)
    farm_name = Column(String(150), nullable=False)
    description = Column(String(500), default="")
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
