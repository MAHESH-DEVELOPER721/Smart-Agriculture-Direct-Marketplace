from pathlib import Path
import sys

from sqlalchemy import MetaData, create_engine, func, select
from sqlalchemy.dialects.postgresql import insert

BACKEND_PATH = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_PATH))

from app.database import Base, engine as postgres_engine
from app.models.product import Product

SQLITE_PATH = BACKEND_PATH / "smart_agri.db"


def migrate():
    if not SQLITE_PATH.exists():
        raise FileNotFoundError(f"SQLite database not found: {SQLITE_PATH}")

    sqlite_engine = create_engine(f"sqlite:///{SQLITE_PATH.as_posix()}")
    source_metadata = MetaData()

    try:
        source_metadata.reflect(bind=sqlite_engine)
        Base.metadata.create_all(bind=postgres_engine)

        with sqlite_engine.connect() as source, postgres_engine.begin() as target:
            for table in Base.metadata.sorted_tables:
                source_table = source_metadata.tables.get(table.name)
                if source_table is None:
                    continue

                if target.scalar(select(func.count()).select_from(table)):
                    raise RuntimeError(
                        f"PostgreSQL table {table.name!r} is not empty. "
                        "Back up the target database and migrate into an empty database."
                    )

                rows = [
                    {
                        column.name: row[column.name]
                        for column in table.columns
                        if column.name in row
                    }
                    for row in source.execute(select(source_table)).mappings()
                ]
                if not rows:
                    continue

                primary_keys = [column.name for column in table.primary_key.columns]
                statement = insert(table).values(rows)
                if primary_keys:
                    statement = statement.on_conflict_do_nothing(
                        index_elements=primary_keys
                    )
                target.execute(statement)

                if "id" in table.c:
                    sequence = target.scalar(
                        select(
                            func.pg_get_serial_sequence(
                                f"public.{table.name}", "id"
                            )
                        )
                    )
                    maximum_id = target.scalar(select(func.max(table.c.id)))
                    if sequence and maximum_id is not None:
                        target.execute(
                            select(func.setval(sequence, maximum_id, True))
                        )

                print(f"Migrated {len(rows)} rows from {table.name}.")
    finally:
        sqlite_engine.dispose()


if __name__ == "__main__":
    migrate()
