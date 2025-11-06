import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';

// Lazy load pages
const LoginPage = React.lazy(() => import('../pages/LoginPage.tsx'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage.tsx'));
const InventoryPage = React.lazy(() => import('../pages/InventoryPage.tsx'));
const EmployeesPage = React.lazy(() => import('../pages/EmployeesPage.tsx'));
const OrdersPage = React.lazy(() => import('../pages/OrdersPage.tsx'));
const ReportsPage = React.lazy(() => import('../pages/ReportsPage.tsx'));
const AdminPage = React.lazy(() => import('../pages/AdminPage.tsx'));
const FinancePage = React.lazy(() => import('../pages/FinancePage.tsx'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage.tsx'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage.tsx'));

/**
 * AppRoutes Component
 * Defines all application routes with protection
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.HOME} element={<DashboardPage />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
        <Route path={ROUTES.EMPLOYEES} element={<EmployeesPage />} />
        <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
        <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        
        {/* Admin Only Routes */}
        <Route element={<ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_MANAGER']} />}>
          <Route path={ROUTES.ADMIN} element={<AdminPage />} />
          <Route path={ROUTES.FINANCE} element={<FinancePage />} />
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
};

export default AppRoutes;
