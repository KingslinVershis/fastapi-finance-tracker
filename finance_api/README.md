# Finance API — Backend Service

The backend REST API service for the **Personal Finance Intelligence Platform**, powered by **FastAPI, PostgreSQL, SQLAlchemy 2.0, Alembic, and Pydantic v2**.

## Key Architecture & Features

- **Layered Architecture**: Strict separation of concerns across `api/` (HTTP transport), `schemas/` (Pydantic validation), `services/` (business logic and financial analytics), `models/` (SQLAlchemy ORM), and `core/` (security, settings, and dependency injection).
- **Decimal Precision**: All financial calculations are executed using Python's `Decimal` module and stored in PostgreSQL as `Numeric(12, 2)` to eliminate floating-point arithmetic errors.
- **Strict Data Isolation**: Every transaction and custom category query filters strictly by the authenticated user ID.
- **System vs. Custom Categories**: Default financial categories (Food, Bills, Transport, Salary, etc.) are seeded as system categories. Users can freely create custom categories, while system categories remain protected from modification or deletion.
- **Comprehensive Analytics Engine**:
  - `GET /api/v1/reports/dashboard`: All-time and monthly totals, net balance, savings rate, categorical spending breakdown, and recent transactions.
  - `GET /api/v1/reports/monthly`: Multi-month chronological trends for income, expenses, net savings, and savings rates.
  - `GET /api/v1/reports/categories`: Categorical breakdown by date range and type with percentage distributions.

## Running Tests

```bash
pytest -v
```

All 34 automated unit and integration tests validate authentication, category management, transaction operations, and exact report mathematics.

