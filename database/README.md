## PostgreSQL setup

The backend uses PostgreSQL through SQLAlchemy and Psycopg 3.

1. Create a PostgreSQL database named `agrinexus` (or choose another name).
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` to your PostgreSQL connection URL.
3. From the repository root, create the tables with `psql -U postgres -d agrinexus -f database/schema.sql`.
4. Install backend dependencies from `backend/requirements.txt` and start the FastAPI application as usual.

The connection URL format is `postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE`. URL encoding is required for reserved characters in credentials.

`schema.sql` is for a new database. It does not copy records from an existing SQLite database. Back up the SQLite file before migrating its data; the old SQLite file was not present in this workspace, so a data transfer could not be performed here.
