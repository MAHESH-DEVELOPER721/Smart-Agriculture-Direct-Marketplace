import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base,engine,SessionLocal
from app.models.product import Product
from app.routes.marketplace import router
app=FastAPI(title="Smart Agriculture Marketplace API")
origins=os.getenv("FRONTEND_ORIGIN","http://localhost:5173").split(",")
app.add_middleware(CORSMiddleware,allow_origins=[x.strip() for x in origins]+["http://localhost:3000"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
Base.metadata.create_all(bind=engine)
app.include_router(router)
def seed():
    db=SessionLocal()
    try:
        if db.query(Product).count()==0:
            db.add_all([
             Product(name="Organic Tomato Seeds",category="Seeds",description="Quality tomato seeds for farm cultivation.",price=120,unit="packet",stock=80),
             Product(name="Groundnut Seeds",category="Seeds",description="Selected groundnut seeds.",price=95,unit="kg",stock=100),
             Product(name="Organic Vermicompost",category="Fertilizers",description="Natural compost to improve soil fertility.",price=250,unit="bag",stock=40),
             Product(name="Neem Oil",category="Pesticides",description="Neem-based crop-care oil. Follow label directions.",price=180,unit="bottle",stock=35),
             Product(name="Drip Irrigation Kit",category="Equipment",description="Basic drip irrigation kit.",price=899,unit="kit",stock=15)])
            db.commit()
    finally: db.close()
seed()
@app.get("/")
def home(): return {"message":"Marketplace API is running"}
@app.get("/health")
def health(): return {"status":"ok"}
