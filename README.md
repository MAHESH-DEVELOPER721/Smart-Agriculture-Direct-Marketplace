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
# Smart Agriculture & Direct Marketplace (AgriDirect)

An integrated full-stack agricultural platform combining **climate-smart agronomy** (soil health analytics, crop recommendations, drought risk warnings, precision irrigation planning) with a **direct farm-to-consumer marketplace** that eliminates middlemen and delivers fresh harvest produce directly to local communities.

---

## 👥 Team Module Ownership & Responsibilities

| Member | Module Domain | Frontend Pages (`src/pages/`) | Backend Routes (`app/routes/`) & Models (`app/models/`) |
| :--- | :--- | :--- | :--- |
| **MAHESH** | **Authentication & System Administration** | `auth/Login.jsx`<br>`auth/Register.jsx`<br>`admin/AdminDashboard.jsx` | `routes/auth.py`<br>`models/user.py`<br>`schemas/auth.py` |
| **ROHIT** | **Soil & Crop Intelligence** | `crop_soil/CropSelection.jsx`<br>`crop_soil/SoilAnalysis.jsx` | `routes/soil.py`<br>`routes/crop.py`<br>`models/soil.py` |
| **SUNDAR** | **Drought Monitoring & Smart Irrigation** | `drought/DroughtMonitoring.jsx`<br>`drought/Irrigation.jsx` | `routes/drought.py`<br>`routes/irrigation.py`<br>`models/drought.py` |
| **MANGA** | **Direct Marketplace & Order Fulfillment** | `marketplace/Products.jsx`<br>`marketplace/Cart.jsx`<br>`marketplace/Orders.jsx` | `routes/marketplace.py`<br>`models/product.py`<br>`models/order.py` |

---

## 📁 Project Architecture

```
Smart-Agriculture-Direct-Marketplace/
│
├── frontend/                         # React.js + Vite Frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx            # Shared Navigation with Cart Badge
│       │   └── Footer.jsx            # Platform Footer
│       │
│       ├── pages/
│       │   ├── auth/                 # MAHESH: Auth Lifecycle
│       │   │   ├── Login.jsx
│       │   │   └── Register.jsx
│       │   │
│       │   ├── admin/                # MAHESH: Admin Oversight
│       │   │   └── AdminDashboard.jsx
│       │   │
│       │   ├── crop_soil/            # ROHIT: Agronomic Intelligence
│       │   │   ├── CropSelection.jsx
│       │   │   └── SoilAnalysis.jsx
│       │   │
│       │   ├── drought/              # SUNDAR: Climate & Water
│       │   │   ├── DroughtMonitoring.jsx
│       │   │   └── Irrigation.jsx
│       │   │
│       │   └── marketplace/          # MANGA: Commerce Engine
│       │       ├── Products.jsx
│       │       ├── Cart.jsx
│       │       └── Orders.jsx
│       │
│       ├── services/
│       │   └── api.js                # API Client, Session & Cart Store
│       │
│       ├── App.jsx                   # Central Router & Hero Landing
│       ├── main.jsx                  # React Entrypoint
│       └── index.css                 # Responsive Design System
│
├── backend/                          # Python FastAPI Backend
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py               # MAHESH: Registration, Login, Admin
│   │   │   ├── soil.py               # ROHIT: Soil Diagnostics & NPK
│   │   │   ├── crop.py               # ROHIT: Recommendations & Calendar
│   │   │   ├── drought.py            # SUNDAR: Drought Index & Alerts
│   │   │   ├── irrigation.py         # SUNDAR: Precision Water Dosing
│   │   │   └── marketplace.py        # MANGA: Produce Catalog & Orders
│   │   │
│   │   ├── models/
│   │   │   ├── user.py               # MAHESH: User ORM Model
│   │   │   ├── soil.py               # ROHIT: SoilReport Model
│   │   │   ├── drought.py            # SUNDAR: DroughtAlert Model
│   │   │   ├── product.py            # MANGA: Product Model
│   │   │   └── order.py              # MANGA: Order & OrderItem Models
│   │   │
│   │   ├── schemas/                  # Pydantic Request/Response Schemas
│   │   ├── services/
│   │   ├── __init__.py
│   │   ├── database.py               # PostgreSQL Engine & SessionLocal
│   │   ├── security.py               # JWT Tokens & Bcrypt Password Hashes
│   │   └── main.py                   # FastAPI Application Entry & CORS
│   │
│   ├── requirements.txt              # Backend Dependencies
│   └── .env.example                  # Environment Configuration Template
│
├── database/
│   ├── schema.sql                    # PostgreSQL DDL Schema
│   └── seed.sql                      # Seed Data Script
│
├── docs/
│   └── api-documentation.md          # Comprehensive REST API Reference
│
├── .gitignore
└── README.md
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested with v24.x)
- **Python**: v3.11+
- **PostgreSQL**: v14+

---

### 2. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # macOS / Linux:
   source venv/bin/activate
   ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env` and configure your PostgreSQL database credentials:
   ```env
   DATABASE_URL=postgresql+psycopg://postgres:1234@localhost:5432/agrinexus
   JWT_SECRET_KEY=your-secure-random-secret
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```

5. Initialize Database:
   Create the `agrinexus` database and apply tables:
   ```bash
   psql -U postgres -d agrinexus -f ../database/schema.sql
   ```

6. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   Interactive API docs are available at `http://localhost:8000/docs`.

---

### 3. Frontend Setup (React + Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📖 API Documentation

Detailed REST API specifications, sample payloads, status codes, and query parameters are documented in [docs/api-documentation.md](docs/api-documentation.md).
