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
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
	auth_router,
	crop_router,
	drought_router,
	irrigation_router,
	marketplace_router,
	soil_router,
)

app = FastAPI(
	title="Smart Agriculture Direct Marketplace API",
	version="1.0.0",
	description="Authentication, crop intelligence, soil analysis, drought monitoring, irrigation planning, and marketplace services for the agriculture platform.",
)

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(crop_router)
app.include_router(drought_router)
app.include_router(irrigation_router)
app.include_router(marketplace_router)
app.include_router(soil_router)


@app.get("/", tags=["Health"])
def root() -> dict[str, str]:
	return {
		"status": "ok",
		"message": "Smart Agriculture Direct Marketplace API is running.",
		"docs": "/docs",
	}


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
	return {"status": "ok"}
