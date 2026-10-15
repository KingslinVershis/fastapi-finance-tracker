const API_BASE = '/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
    } else {
      localStorage.removeItem('access_token');
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    } else {
      localStorage.removeItem('refresh_token');
    }
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const headers = isFormData
      ? { ...options.headers }
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    let response = await fetch(url, config);

    // If 401 and we have a refresh token, attempt to refresh
    if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${this.token}`;
        response = await fetch(url, { ...options, headers });
      } else {
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    }

    // Parse JSON or text
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || (typeof data === 'string' ? data : 'API Request failed');
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  async refreshAccessToken() {
    try {
      const resp = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      if (resp.ok) {
        const data = await resp.json();
        this.setTokens(data.access_token, data.refresh_token);
        return true;
      }
    } catch {
      // Fall through to failure
    }
    return false;
  }

  // HTTP Helpers
  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth Endpoints
  async register(email, password, full_name) {
    const data = await this.post('/auth/register', { email, password, full_name });
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  async login(email, password) {
    const data = await this.post('/auth/login', { email, password });
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  getMe() {
    return this.get('/users/me');
  }

  updateProfile(data) {
    return this.patch('/users/me', data);
  }

  changePassword(data) {
    return this.post('/users/me/change-password', data);
  }

  // Categories
  getCategories(type) {
    return this.get('/categories', { type });
  }

  createCategory(data) {
    return this.post('/categories', data);
  }

  updateCategory(id, data) {
    return this.patch(`/categories/${id}`, data);
  }

  deleteCategory(id) {
    return this.delete(`/categories/${id}`);
  }

  // Transactions
  getTransactions(params) {
    return this.get('/transactions', params);
  }

  getTransaction(id) {
    return this.get(`/transactions/${id}`);
  }

  createTransaction(data) {
    return this.post('/transactions', data);
  }

  updateTransaction(id, data) {
    return this.patch(`/transactions/${id}`, data);
  }

  deleteTransaction(id) {
    return this.delete(`/transactions/${id}`);
  }

  clearAllTransactions() {
    return this.delete('/transactions/clear-all');
  }

  importTransactions(files) {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    return this.request('/transactions/import', {
      method: 'POST',
      body: formData,
    });
  }

  async exportTransactionsCsv(params = {}) {
    const csvText = await this.get('/transactions/export', params);
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'finance_intel_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async downloadImportTemplate(format = 'csv') {
    const fmt = format.toLowerCase() === 'pdf' ? 'pdf' : 'csv';
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const resp = await fetch(`${API_BASE}/transactions/import-template?format=${fmt}`, {
      method: 'GET',
      headers,
    });
    if (!resp.ok) {
      throw new Error(`Failed to download ${fmt.toUpperCase()} template.`);
    }
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_import_template.${fmt}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Analytics & Reports
  getDashboard(search = '') {
    return this.get('/reports/dashboard', { search });
  }

  getMonthlyReport(months = 6) {
    return this.get('/reports/monthly', { months });
  }

  getCategoryReport(startDate, endDate, type = 'expense') {
    return this.get('/reports/categories', {
      start_date: startDate,
      end_date: endDate,
      type,
    });
  }

  // Admin Management
  getAdminOverview() {
    return this.get('/admin/overview');
  }

  updateAdminUser(userId, data) {
    return this.patch(`/admin/users/${userId}`, data);
  }

  deleteAdminUser(userId) {
    return this.delete(`/admin/users/${userId}`);
  }

  // Budgets & Threshold Alerts
  getBudgetOverview() {
    return this.get('/budgets/overview');
  }

  getBudgets() {
    return this.get('/budgets');
  }

  createBudget(data) {
    return this.post('/budgets', data);
  }

  updateBudget(id, data) {
    return this.patch(`/budgets/${id}`, data);
  }

  deleteBudget(id) {
    return this.delete(`/budgets/${id}`);
  }

  testBudgetAlert(id) {
    return this.post(`/budgets/${id}/test-alert`);
  }

  getAlertNotifications() {
    return this.get('/budgets/notifications');
  }
}

export const api = new ApiClient();
export default api;

