import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv


DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[1] / "smart_agriculture.db"
load_dotenv(Path(__file__).resolve().parents[1] / ".env")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DATABASE_PATH.as_posix()}")

engine_options = {}
if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
from dotenv import load_dotenv
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

database_url = os.getenv("DATABASE_URL")
if database_url:
    engine_url = database_url
else:
    password = os.getenv("POSTGRES_PASSWORD")
    if not password:
        raise RuntimeError(
            "Set POSTGRES_PASSWORD or DATABASE_URL in backend/.env before starting the API."
        )
    engine_url = URL.create(
        drivername="postgresql+psycopg",
        username=os.getenv("POSTGRES_USER", "postgres"),
        password=password,
        host=os.getenv("POSTGRES_HOST", "127.0.0.1"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "smart_agri"),
    )

engine = create_engine(engine_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
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
        db.close()
