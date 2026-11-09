"""Copy matching application tables from SQLite into the configured PostgreSQL DB.

Run from the backend directory after configuring DATABASE_URL in .env:
    python migrate_sqlite_to_postgres.py path/to/old.sqlite

The destination tables are created if needed. Existing destination rows are not
deleted; primary-key conflicts abort the transaction instead of overwriting data.
"""

import argparse
from pathlib import Path

from sqlalchemy import MetaData, Table, create_engine, inspect, select, text
from sqlalchemy.engine import Engine

from app.database import Base, engine as postgres_engine
from app import models  # noqa: F401 - register every model with Base.metadata


def copy_sqlite_data(sqlite_path: Path, destination: Engine = postgres_engine) -> None:
    if not sqlite_path.is_file():
        raise FileNotFoundError(f"SQLite database not found: {sqlite_path}")

    sqlite_engine = create_engine(f"sqlite:///{sqlite_path.resolve().as_posix()}")
    try:
        source_inspector = inspect(sqlite_engine)
        source_names = set(source_inspector.get_table_names())
        target_names = set(Base.metadata.tables)
        table_names = [name for name in Base.metadata.tables if name in source_names]
        missing_tables = sorted(target_names - source_names)
        if not table_names:
            raise RuntimeError("No application tables from this project were found in the SQLite database.")

        Base.metadata.create_all(destination)
        source_metadata = MetaData()
        with sqlite_engine.connect() as source, destination.begin() as target:
            for name in table_names:
                source_table = Table(name, source_metadata, autoload_with=sqlite_engine)
                target_table = Base.metadata.tables[name]
                common_columns = [
                    column.name for column in target_table.columns
                    if column.name in source_table.c
                ]
                result = source.execute(select(source_table))
                copied = 0
                while rows := result.fetchmany(1000):
                    records = [
                        {column: row[column] for column in common_columns}
                        for row in rows
                    ]
                    if records:
                        target.execute(target_table.insert(), records)
                        copied += len(records)
                print(f"Copied {copied} rows from {name}.")

                if "id" in target_table.c:
                    target.execute(
                        text(
                            "SELECT setval(pg_get_serial_sequence(:table_name, 'id'), "
                            "COALESCE((SELECT MAX(id) FROM \"" + name + "\"), 1), "
                            "EXISTS(SELECT 1 FROM \"" + name + "\"))"
                        ),
                        {"table_name": name},
                    )

        if missing_tables:
            print("SQLite database did not contain these tables: " + ", ".join(missing_tables))
    finally:
        sqlite_engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sqlite_file", type=Path, help="Path to the existing SQLite database file")
    args = parser.parse_args()
    copy_sqlite_data(args.sqlite_file)


if __name__ == "__main__":
    main()