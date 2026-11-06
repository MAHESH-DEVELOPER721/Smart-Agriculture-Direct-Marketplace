# Smart Agriculture Direct Marketplace

The crop and soil tools provide a simple React interface backed by FastAPI.
Their sample rules are educational examples, not validated agronomic advice.

## Set up PostgreSQL

Install and start PostgreSQL Server. Create the application database, then
create the tables from the repository root:

```powershell
createdb -U postgres smart_agriculture
psql -U postgres -d smart_agriculture -f database/schema.sql
```

Alternatively, create a database named `smart_agriculture` in pgAdmin and run
`database/schema.sql` while connected to that database.

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` to your
PostgreSQL username, password, host, port, and database. For example:

```text
DATABASE_URL=postgresql+psycopg://postgres:your_password@127.0.0.1:5432/smart_agriculture
```

Use your actual PostgreSQL credentials; URL-encode special characters in the
password.

## Run the backend

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend connects to PostgreSQL through SQLAlchemy and Psycopg. It creates any
missing application tables on startup. API documentation is available at
`http://localhost:8000/docs`.

Crop input values and each matching suggestion are saved directly in
`crop_recommendations`. To view them in PostgreSQL:

```sql
SELECT nitrogen, phosphorus, potassium, ph, soil_type,
       rainfall_mm, temperature_c, crop_name, reason, created_at
FROM crop_recommendations
ORDER BY created_at DESC;
```

Submit a new crop selection after starting the updated backend to see its input
values in PostgreSQL. Older recommendation rows retain null input fields because
the application did not store their conditions when they were created.

## Run the frontend

Use Node.js 20.19 or newer, then from the repository root:

```powershell
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:8000`. Set
`VITE_API_BASE_URL` in the frontend environment to use a different backend URL.