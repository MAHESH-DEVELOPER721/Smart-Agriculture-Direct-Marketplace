import os
from pathlib import Path
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from dotenv import load_dotenv
from sqlalchemy.orm import Session, declarative_base, sessionmaker


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Create backend/.env from backend/.env.example "
        "and configure your PostgreSQL connection."
    )

if make_url(DATABASE_URL).drivername != "postgresql+psycopg":
    raise RuntimeError(
        "DATABASE_URL must use PostgreSQL with Psycopg "
        "(postgresql+psycopg://...)."
    )

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    with SessionLocal.begin() as session:
        yield session