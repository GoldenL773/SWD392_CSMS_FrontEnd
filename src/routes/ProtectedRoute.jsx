import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth.jsx';
import { ROUTES } from '../utils/constants.jsx';
import AppLayout from '../components/layout/AppLayout/index.jsx';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and optional role-based access
 */
const ProtectedRoute = ({ requiredRoles = [], withLayout = true }) => {
  const { isAuthenticated, hasAnyRole, user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="loading"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check role-based access if required
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    // Redirect to appropriate default page based on role
    if (hasAnyRole(['STAFF'])) {
      return <Navigate to={ROUTES.ATTENDANCE} replace />;
    }
    if (hasAnyRole(['BARISTA'])) {
      return <Navigate to={ROUTES.ORDER_QUEUE} replace />;
    }
    if (hasAnyRole(['FINANCE'])) {
      return <Navigate to={ROUTES.FINANCE} replace />;
    }
    return <Navigate to={ROUTES.ATTENDANCE} replace />;
  }

  // Render with/without AppLayout wrapper
  if (withLayout) {
    return (
      <AppLayout>
        <Outlet />
      </AppLayout>
    );
  }
  return <Outlet />;
};

ProtectedRoute.propTypes = {
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  withLayout: PropTypes.bool
};

export default ProtectedRoute;
