# Finance Web — React Frontend

The frontend user interface for the **Personal Finance Intelligence Platform**, built with **React 18, React Router v6, Chart.js, Lucide Icons, and Vite**.

## Key Architecture & Features

- **Automated JWT Interceptor**: Silent refresh token management via `src/api/client.js`. Upon 401 Unauthorized responses, the client requests a refreshed access token and retries the request seamlessly.
- **Financial Analytics Visualizations**:
  - Income vs. Expenses multi-month bar chart trend.
  - Spending by category doughnut chart with dynamic percentage calculations.
  - Category breakdown with visual progress meters.
- **Full Transaction Management**:
  - Multi-parameter filtering (by type, category, search query, date range, and sort order).
  - Modal-based creation and inline editing with category type validation.
  - Dynamic client-side and server-side pagination.
- **Role-Aware Category Management**:
  - Displays protected default system categories alongside user custom categories.
  - Allows inline creation, editing, and deletion of custom categories.

## Development & Build

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```

