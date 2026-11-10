import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import (
    api_notifications_router,
    auth_router,
    crop_router,
    drought_router,
    irrigation_router,
    marketplace_router,
    notifications_router,
    payment_api_router,
    payments_router,
    soil_router,
)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    try:
        from app import models  # noqa: F401
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[STARTUP] Table creation note: {e}")
    yield


app = FastAPI(
    title="Smart Agriculture Direct Marketplace API",
    version="1.0.0",
    description="Authentication, crop intelligence, soil analysis, drought monitoring, irrigation planning, and marketplace services.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(crop_router)
app.include_router(drought_router)
app.include_router(irrigation_router)
app.include_router(marketplace_router)
app.include_router(payments_router)
app.include_router(payment_api_router)
app.include_router(notifications_router)
app.include_router(api_notifications_router)
app.include_router(soil_router)


@app.get("/", tags=["Health"])
def root() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "Smart Agriculture Direct Marketplace API is running.",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

