import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleBasedRedirect from './RoleBasedRedirect.jsx';

// Lazy load pages
const HomePage = React.lazy(() => import('../pages/HomePage.tsx'));
const LoginPage = React.lazy(() => import('../pages/LoginPage.jsx'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage.jsx'));
const InventoryPage = React.lazy(() => import('../pages/InventoryPage.jsx'));
const EmployeesPage = React.lazy(() => import('../pages/EmployeesPage.jsx'));
const OrdersPage = React.lazy(() => import('../pages/OrdersPage.jsx'));
const MenuPage = React.lazy(() => import('../pages/MenuPage.jsx'));
const ReportsPage = React.lazy(() => import('../pages/ReportsPage.jsx'));
const AttendancePage = React.lazy(() => import('../pages/AttendancePage.jsx'));
const AdminPage = React.lazy(() => import('../pages/AdminPage.jsx'));
const FinancePage = React.lazy(() => import('../pages/FinancePage.jsx'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage.jsx'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage.jsx'));

/**
 * AppRoutes Component
 * Defines all application routes with protection
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Common routes - accessible by all authenticated users */}
        <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
        <Route path={ROUTES.MENU} element={<MenuPage />} />
        <Route path={ROUTES.ATTENDANCE} element={<AttendancePage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        
        {/* Dashboard - Manager/Finance only */}
        <Route element={<ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'FINANCE']} />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.FINANCE} element={<FinancePage />} />
        </Route>
        
        {/* Manager only routes */}
        <Route element={<ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']} />}>
          <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
          <Route path={ROUTES.EMPLOYEES} element={<EmployeesPage />} />
          <Route path={ROUTES.ADMIN} element={<AdminPage />} />
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
};

export default AppRoutes;
