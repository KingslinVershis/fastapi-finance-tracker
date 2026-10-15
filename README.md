# Personal Finance Intelligence Platform

A production-grade full-stack personal finance and financial intelligence analytics platform built with **Python, FastAPI, React, PostgreSQL, SQLAlchemy, Alembic, and Docker**.

This platform moves beyond basic CRUD expense trackers by providing authoritative backend financial analytics, deterministic `Decimal`-accurate monetary math, strict multi-tenant data isolation, JWT authentication with silent refresh tokens, and rich visual dashboards.

---

## 🏗️ System Architecture

```text
                                 +-----------------------+
                                 |   Web Client (React)  |
                                 |   Vite + Chart.js     |
                                 |   Port 3000           |
                                 +-----------+-----------+
                                             |
                                             | HTTP / REST (JWT)
                                             v
                                 +-----------------------+
                                 |  Backend (FastAPI)    |
                                 |  Uvicorn (Python 3.12)|
                                 |  Port 8000            |
                                 +-----------+-----------+
                                             |
                                             | SQLAlchemy 2.0 (ORM)
                                             | Alembic Migrations
                                             v
                                 +-----------------------+
                                 | PostgreSQL Database   |
                                 | Port 5432             |
                                 +-----------------------+
```

### Monorepo Structure

```text
python_fastapi/
├── finance_api/                   # FastAPI Backend
│   ├── app/
│   │   ├── main.py                # App entrypoint, CORS, lifespan startup
│   │   ├── api/v1/                # Versioned REST API endpoints
│   │   │   ├── auth.py            # Register, Login (JSON + OAuth2), Refresh, Logout
│   │   │   ├── users.py           # User profile & credentials management
│   │   │   ├── categories.py      # Default system & custom categories
│   │   │   ├── transactions.py    # Income/expense transactions with filtering & pagination
│   │   │   └── reports.py         # Authoritative financial analytics & trends
│   │   ├── models/                # SQLAlchemy database models
│   │   │   ├── user.py            # User identity model
│   │   │   ├── category.py        # Categories with system vs user isolation
│   │   │   └── transaction.py     # Unified income/expense model with Decimal precision
│   │   ├── schemas/               # Pydantic v2 validation models
│   │   ├── services/              # Pure business logic & financial calculation layer
│   │   ├── database/              # Engine, sessionmaker, and Base metadata
│   │   └── core/                  # Settings (pydantic-settings), JWT security, dependencies
│   ├── migrations/                # Alembic schema migrations
│   ├── tests/                     # Comprehensive Pytest test suite (34 tests)
│   ├── Dockerfile                 # Multi-stage Python 3.12 Dockerfile
│   └── requirements.txt
│
├── finance_web/                   # React Frontend (Vite)
│   ├── src/
│   │   ├── api/client.js          # Fetch client with auto-refresh token interceptor
│   │   ├── context/AuthContext.js # Authentication context & state management
│   │   ├── components/            # Reusable UI & Chart.js visualization components
│   │   │   ├── SummaryCard.jsx    # KPI metrics (Income, Expenses, Net, Savings Rate)
│   │   │   ├── IncomeExpenseChart # 6-month bar trend visualizer
│   │   │   ├── SpendingChart.jsx  # Categorical doughnut chart
│   │   │   ├── CategoryBreakdown  # Percentage-based progress breakdown
│   │   │   ├── TransactionForm    # Add/Edit modal dialog
│   │   │   ├── TransactionTable   # Data table with badges & actions
│   │   │   ├── TransactionFilters # Search, type, category, date filters
│   │   │   └── Pagination.jsx     # Dynamic pagination controls
│   │   ├── pages/                 # Full routed views
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   ├── CategoriesPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── App.jsx                # Router & protected route guards
│   │   └── main.jsx
│   ├── Dockerfile                 # Multi-stage Node builder + Nginx SPA server
│   └── nginx.conf
│
├── docker-compose.yml             # Orchestration for DB, Backend, and Frontend
└── README.md
```

---

## 🚀 Quick Start with Docker Compose

To start the complete platform (PostgreSQL, FastAPI backend, and React frontend):

```bash
docker compose up --build
```

Access the applications:
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs (Swagger)**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **FastAPI ReDoc**: [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)

---

## 💻 Local Development Setup

### 1. Backend (`finance_api`)

```bash
cd finance_api

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (`finance_web`)

```bash
cd finance_web

# Install npm dependencies
npm install

# Start Vite development server (proxies /api to http://localhost:8000)
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

The backend includes a comprehensive Pytest test suite covering authentication, authorization, role isolation, transaction filtering, pagination, and deterministic financial calculations.

```bash
cd finance_api
./venv/bin/pytest -v
```

### Test Coverage Highlights:
- **Authentication**: User registration, duplicate email rejection, password strength validation, JSON login, OAuth2 form login, refresh token lifecycle, logout, and unauthorized request handling.
- **Data Isolation**: Verified that User B can never read, modify, or delete transactions or custom categories owned by User A.
- **Financial Analytics**: Validated deterministic `Decimal` arithmetic for income, expense totals, net balances, and savings percentages.
- **Domain Integrity**: Validated that transactions cannot be assigned to mismatched category types (e.g., an expense transaction assigned to an income category).

---

## 🔒 Security Highlights

- **Password Hashing**: Bcrypt with automated salt generation.
- **JWT Authentication**: Short-lived access tokens (1 hour) coupled with long-lived refresh tokens (7 days).
- **Data Isolation**: Strict user-scoped querying at the service layer prevents unauthorized cross-tenant data access.
- **Monetary Precision**: Stored in PostgreSQL as `Numeric(12, 2)` and calculated in Python using `Decimal` to eliminate binary floating-point rounding errors.
- **Protected Categories**: Built-in default categories are protected against mutation or deletion by users.

---

## 📄 License
MIT License.

