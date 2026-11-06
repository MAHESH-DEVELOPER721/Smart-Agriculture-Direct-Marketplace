from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    description: str
    price: float
    unit: str
    stock: int
    image_url: str | None = None


class OrderItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=100_000)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=5, max_length=30)
    address: str = Field(min_length=5, max_length=500)
    items: list[OrderItemCreate] = Field(min_length=1, max_length=50)

    @model_validator(mode="after")
    def validate_order(self):
        if not self.customer_name.strip():
            raise ValueError("Customer name cannot be blank")
        if not self.phone.strip():
            raise ValueError("Phone number cannot be blank")
        if not self.address.strip():
            raise ValueError("Delivery address cannot be blank")
        product_ids = [item.product_id for item in self.items]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("Each product can only appear once in an order")
        return self


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    phone: str
    address: str
    total_amount: float
    status: str
    created_at: datetime
    items: list[OrderItemOut]
