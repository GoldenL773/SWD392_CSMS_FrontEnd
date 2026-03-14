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
const OrderQueuePage = React.lazy(() => import('../pages/OrderQueuePage.jsx'));
const MenuPage = React.lazy(() => import('../pages/MenuPage.jsx'));
const RecipesPage = React.lazy(() => import('../pages/RecipesPage.jsx'));
const SuppliersPage = React.lazy(() => import('../pages/SuppliersPage.jsx'));
const PaymentPage = React.lazy(() => import('../pages/PaymentPage.jsx'));
const ReportsPage = React.lazy(() => import('../pages/ReportsPage.jsx'));
const AttendancePage = React.lazy(() => import('../pages/AttendancePage.jsx'));
const AdminPage = React.lazy(() => import('../pages/AdminPage.jsx'));
const FinancePage = React.lazy(() => import('../pages/FinancePage.jsx'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage.jsx'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage.jsx'));
const PromotionsPage = React.lazy(() => import('../pages/PromotionsPage.jsx'));

/**
 * AppRoutes Component
 * Defines all application routes with protection
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.HOME} element={
        <React.Suspense fallback={<div className="loading" />}>
          <RoleBasedRedirect defaultElement={<HomePage />} />
        </React.Suspense>
      } />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Common routes - accessible by all authenticated users */}
        <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
        <Route path={ROUTES.ORDER_QUEUE} element={<OrderQueuePage />} />
        <Route path={ROUTES.MENU} element={<MenuPage />} />
        <Route path={ROUTES.ATTENDANCE} element={<AttendancePage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        <Route path={ROUTES.PAYMENT} element={<PaymentPage />} />
        
        {/* Dashboard - Manager/Finance only */}
        <Route element={<ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'FINANCE']} withLayout={false} />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.FINANCE} element={<FinancePage />} />
        </Route>
        
        {/* Manager only routes */}
        <Route element={<ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']} withLayout={false} />}>
          <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
          <Route path={ROUTES.EMPLOYEES} element={<EmployeesPage />} />
          <Route path={ROUTES.RECIPES} element={<RecipesPage />} />
          <Route path={ROUTES.SUPPLIERS} element={<SuppliersPage />} />
          <Route path={ROUTES.PROMOTIONS} element={<PromotionsPage />} />
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
};

export default AppRoutes;
