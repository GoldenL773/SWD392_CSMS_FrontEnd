import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ROUTES } from '../utils/constants.jsx';

/**
 * RoleBasedRedirect Component
 * Redirects users to appropriate default page based on their role
 */
const RoleBasedRedirect = () => {
  const { user, hasAnyRole } = useAuth();

  // Determine default route based on role
  const getDefaultRoute = () => {
    if (!user || !user.roles || user.roles.length === 0) {
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

    // Barista default: /orders
    if (hasAnyRole(['BARISTA'])) {
      return ROUTES.ORDERS;
    }

    // Manager/Admin default: /dashboard
    if (hasAnyRole(['MANAGER', 'ADMIN'])) {
      return ROUTES.DASHBOARD;
    }

    // Fallback
    return ROUTES.DASHBOARD;
  };

  return <Navigate to={getDefaultRoute()} replace />;
};

export default RoleBasedRedirect;
