import logging
import os
from dotenv import load_dotenv

from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()
logger = logging.getLogger("app.database")


class Base(DeclarativeBase):
    pass


def create_app_engine():
    db_url_str = os.getenv("DATABASE_URL")

    # If SQLite explicitly requested
    if db_url_str and db_url_str.startswith("sqlite"):
        return create_engine(
            db_url_str,
            connect_args={"check_same_thread": False},
        )

    # Resolve PostgreSQL connection URL
    if db_url_str:
        db_url = make_url(db_url_str)
        if db_url.drivername in {"postgres", "postgresql"}:
            db_url = db_url.set(drivername="postgresql+psycopg")
    else:
        db_url = URL.create(
            drivername="postgresql+psycopg",
            username=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "1234"),
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", "5432")),
            database=os.getenv("DB_NAME", "agrinexus"),
        )

    # Test if PostgreSQL is reachable
    try:
        pg_engine = create_engine(
            db_url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 2} if "psycopg" in str(db_url) else {},
        )
        with pg_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[DATABASE] Connected to PostgreSQL database successfully.")
        return pg_engine
    except Exception as exc:
        print(f"[DATABASE WARNING] PostgreSQL connection failed: {exc}")
        print("[DATABASE NOTICE] Automatically using local SQLite database (./agrinexus.db) so your platform keeps working without interruptions.")
        return create_engine(
            "sqlite:///./agrinexus.db",
            connect_args={"check_same_thread": False},
        )


engine = create_app_engine()

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def init_db():
    try:
        from app import models  # noqa: F401
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[DATABASE] Table initialization note: {e}")


init_db()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
