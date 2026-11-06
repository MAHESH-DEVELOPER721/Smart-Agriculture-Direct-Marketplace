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
python -m uvicorn app.main:app --reload
```

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