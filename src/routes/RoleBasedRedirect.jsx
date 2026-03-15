import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ROUTES } from '../utils/constants.jsx';

/**
 * RoleBasedRedirect Component
 * Redirects users to appropriate default page based on their role
 * Or shows the default element if provided and no redirect is needed
 */
const RoleBasedRedirect = () => {
  const { user, hasAnyRole } = useAuth();

  // If not logged in, redirect to login
  if (!user || !user.roles || user.roles.length === 0) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Determine default route based on role
  const getDefaultRoute = () => {
    // Manager/Admin default: /dashboard
    if (hasAnyRole(['MANAGER', 'ADMIN'])) {
      return ROUTES.DASHBOARD;
    }

    // Staff default: /attendance
    if (hasAnyRole(['STAFF'])) {
      return ROUTES.ATTENDANCE;
    }

    // Finance default: /finance
    if (hasAnyRole(['FINANCE'])) {
      return ROUTES.FINANCE;
    }

    // Barista default: /order-queue (Kitchen Display System)
    if (hasAnyRole(['BARISTA'])) {
      return ROUTES.ORDER_QUEUE;
    }

    // Fallback
    return ROUTES.DASHBOARD;
  };

  const route = getDefaultRoute();
  return <Navigate to={route} replace />;
};

export default RoleBasedRedirect;
