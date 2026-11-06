from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, update
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Order, OrderItem, Product
from app.schemas.marketplace import OrderCreate, OrderOut, ProductOut

router = APIRouter(prefix="/api/marketplace", tags=["Marketplace"])


@router.get("/products", response_model=list[ProductOut])
def list_products(
    search: str | None = Query(default=None, max_length=120),
    category: str | None = Query(default=None, max_length=80),
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.active.is_(True))
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(term),
                Product.description.ilike(term),
                Product.category.ilike(term),
            )
        )
    if category and category.strip().lower() != "all":
        query = query.filter(Product.category.ilike(category.strip()))
    return query.order_by(Product.category, Product.name).all()


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.active.is_(True))
        .first()
    )
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/orders", response_model=OrderOut, status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    checked_items: list[tuple[Product, int]] = []
    total = 0.0

    for item in data.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id, Product.active.is_(True))
            .first()
        )
        if product is None:
            raise HTTPException(
                status_code=404, detail=f"Product {item.product_id} not found"
            )

        updated = db.execute(
            update(Product)
            .where(
                Product.id == item.product_id,
                Product.active.is_(True),
                Product.stock >= item.quantity,
            )
            .values(stock=Product.stock - item.quantity)
        )
        if updated.rowcount != 1:
            db.refresh(product)
            raise HTTPException(
                status_code=400,
                detail=f"Only {product.stock} {product.unit} available for {product.name}",
            )

        checked_items.append((product, item.quantity))
        total += product.price * item.quantity

    order = Order(
        customer_name=data.customer_name.strip(),
        phone=data.phone.strip(),
        address=data.address.strip(),
        total_amount=round(total, 2),
        status="Placed",
    )
    db.add(order)
    db.flush()

    for product, quantity in checked_items:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                quantity=quantity,
                unit_price=product.price,
            )
        )

    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=list[OrderOut])
def list_orders(
    phone: str = Query(min_length=5, max_length=30),
    db: Session = Depends(get_db),
):
    return (
        db.query(Order)
        .filter(Order.phone == phone.strip())
        .order_by(Order.created_at.desc(), Order.id.desc())
        .all()
    )
