from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import Base, engine
from app.models.soil import CropRecommendation, SoilTest
from app.routes.crop import router as crop_router
from app.routes.soil import router as soil_router


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    Base.metadata.create_all(
        bind=engine,
        tables=[SoilTest.__table__, CropRecommendation.__table__],
    )
    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE soil_tests ADD COLUMN IF NOT EXISTS rainfall_mm DOUBLE PRECISION")
        )
        connection.execute(
            text("ALTER TABLE soil_tests ADD COLUMN IF NOT EXISTS temperature_c DOUBLE PRECISION")
        )
        for column in (
            "nitrogen DOUBLE PRECISION",
            "phosphorus DOUBLE PRECISION",
            "potassium DOUBLE PRECISION",
            "ph DOUBLE PRECISION",
            "soil_type VARCHAR(50)",
            "rainfall_mm DOUBLE PRECISION",
            "temperature_c DOUBLE PRECISION",
        ):
            connection.execute(
                text(f"ALTER TABLE crop_recommendations ADD COLUMN IF NOT EXISTS {column}")
            )
    yield


app = FastAPI(
    title="Smart Agriculture Direct Marketplace API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(soil_router)
app.include_router(crop_router)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "Smart Agriculture API is running.",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}