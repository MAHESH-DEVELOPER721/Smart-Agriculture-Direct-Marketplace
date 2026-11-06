# Smart-Agriculture-Direct-Marketplace

## Run Sundar's drought and irrigation pages

Open two PowerShell terminals in the project root.

### 1. Start the backend

```powershell
Set-Location .\backend

# If the venv folder does not exist yet, create it with:
# py -3.12 -m venv .venv312

.\.venv312\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env and replace YOUR_PASSWORD with your local PostgreSQL password.
python -m uvicorn app.main:app --reload
```

Create a PostgreSQL database named `smart_agriculture` first (for example, in
pgAdmin). The backend reads `DATABASE_URL` from `backend/.env` and creates the
drought readings table at startup. Keep `.env` private; it is ignored by Git.
If `DATABASE_URL` is unset, the backend falls back to the local SQLite database.
Existing SQLite readings are not copied automatically.

If PowerShell blocks activation scripts, allow it for this terminal only, then
activate the environment:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv312\Scripts\Activate.ps1
```

The backend API documentation is available at <http://127.0.0.1:8000/docs>.

### 2. Start the frontend

In the second terminal:

```powershell
Set-Location .\frontend
npm.cmd install
node .\node_modules\vite\bin\vite.js --host 127.0.0.1
```

Open the local URL printed by Vite, usually <http://localhost:5173>. Keep both
terminals running while using the app. Press `Ctrl+C` in each terminal to stop
the corresponding server.