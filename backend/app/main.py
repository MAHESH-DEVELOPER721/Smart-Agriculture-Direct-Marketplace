from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models.drought import DroughtReading
from app.routes.drought import router as drought_router
from app.routes.irrigation import router as irrigation_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    DroughtReading.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Smart Agriculture API",
    description="Drought monitoring and irrigation planning endpoints.",
    version="1.0.0",
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

app.include_router(drought_router, prefix="/api")
app.include_router(irrigation_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Smart Agriculture API is running"}