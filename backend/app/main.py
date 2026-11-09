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
