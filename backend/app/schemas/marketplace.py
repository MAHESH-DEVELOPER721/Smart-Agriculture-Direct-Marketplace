from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=60)
    price: float = Field(..., gt=0)
    unit: str = Field("kg", max_length=40)
    stock: int = Field(..., ge=0)
    farm_name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = Field("", max_length=500)
    is_featured: Optional[bool] = False


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    price: float
    quantity: int = Field(..., gt=0)
    unit: str = "kg"


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=120)
    customer_email: EmailStr
    customer_phone: Optional[str] = Field("", max_length=30)
    shipping_address: str = Field(..., min_length=5, max_length=300)
    items: List[OrderItemCreate] = Field(..., min_items=1)
    payment_method: Optional[str] = "cod"


class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: str
    price: float
    quantity: int
    unit: str

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_code: str
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    total_amount: float
    status: str
    items: List[OrderItemResponse] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

