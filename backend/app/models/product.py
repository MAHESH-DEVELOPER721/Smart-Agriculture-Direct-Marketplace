from sqlalchemy import Column,Integer,String,Float,Boolean,DateTime,ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
class Product(Base):
    __tablename__="products"
    id=Column(Integer,primary_key=True,index=True)
    name=Column(String(120),nullable=False,index=True)
    category=Column(String(80),nullable=False,default="Other")
    description=Column(String(1000),nullable=False,default="")
    price=Column(Float,nullable=False)
    unit=Column(String(30),nullable=False,default="kg")
    stock=Column(Integer,nullable=False,default=0)
    image_url=Column(String(500))
    active=Column(Boolean,nullable=False,default=True)
class Order(Base):
    __tablename__="orders"
    id=Column(Integer,primary_key=True,index=True)
    customer_name=Column(String(120),nullable=False)
    phone=Column(String(30),nullable=False)
    address=Column(String(500),nullable=False)
    total_amount=Column(Float,nullable=False)
    status=Column(String(40),nullable=False,default="Placed")
    created_at=Column(DateTime,default=datetime.utcnow,nullable=False)
    items=relationship("OrderItem",back_populates="order",cascade="all, delete-orphan")
class OrderItem(Base):
    __tablename__="order_items"
    id=Column(Integer,primary_key=True,index=True)
    order_id=Column(Integer,ForeignKey("orders.id"),nullable=False)
    product_id=Column(Integer,ForeignKey("products.id"),nullable=False)
    product_name=Column(String(120),nullable=False)
    quantity=Column(Integer,nullable=False)
    unit_price=Column(Float,nullable=False)
    order=relationship("Order",back_populates="items")
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
