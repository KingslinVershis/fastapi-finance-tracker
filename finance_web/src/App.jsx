import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, ThemeToggleButton } from './context/ThemeContext';
import Sidebar, { MobileMenuButton } from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import BudgetsPage from './pages/BudgetsPage';

const SecondaryTopBar = () => {
  const location = useLocation();
  if (location.pathname === '/dashboard') {
    return null;
  }

  const pageTitles = {
    '/transactions': 'Transactions Ledger',
    '/reports': 'Reports & P&L Intelligence',
    '/budgets': 'Budgets & Threshold Alerts',
    '/categories': 'Category Governance',
    '/admin': 'Admin & Entities Control',
    '/settings': 'Security & Vault Settings',
  };

  const title = pageTitles[location.pathname] || 'Finance Intel';

  return (
    <header
      className="sticky top-0 z-30 bg-obsidian-900/80 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3"
      data-purpose="top-navigation-bar"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <MobileMenuButton />
        <span className="text-sm font-bold text-white truncate">{title}</span>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Sync
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggleButton />
      </div>
    </header>
  );
};

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian-950 text-slate-400 text-sm">
        Loading Finance Intel...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-obsidian-950 text-slate-100 antialiased bg-grid-mesh selection:bg-brand-cobalt selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <SecondaryTopBar />
        {children}
      </div>
    </div>
  );
};

// Public Route wrapper (redirects authenticated users to dashboard)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budgets"
              element={
                <ProtectedRoute>
                  <BudgetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
