# Smart-Agriculture-Direct-Marketplace

## Marketplace

The React marketplace is in `frontend/`; its product catalog, cart checkout, and
order lookup use the FastAPI service in `backend/`, backed by PostgreSQL.

1. Install PostgreSQL and create the `smart_agri` database (the default role is
   `postgres`).
2. Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`,
   and `POSTGRES_DB` in `backend/.env`. Use `backend/.env.example` as a template;
   never commit the real `.env` file.
3. Install dependencies and migrate existing SQLite data from the `backend/`
   directory:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python scripts\migrate_sqlite_to_postgres.py
   ```

4. Start the API from `backend/` and the frontend from `frontend/`:

   ```powershell
   uvicorn app.main:app --reload
   ```

   ```powershell
   cd ..\frontend
   npm install
   npm run dev
   ```

The frontend defaults to `http://localhost:8000` for the API. Set
`VITE_API_BASE_URL` in a frontend `.env` file to override it. The API seeds a
small set of sample products on first run if the PostgreSQL products table is
empty. The migration script requires the target tables to be empty and preserves
IDs from `backend/smart_agri.db`.
