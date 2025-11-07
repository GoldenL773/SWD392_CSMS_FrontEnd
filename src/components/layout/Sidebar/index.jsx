import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ROUTES } from '../../../utils/constants.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import './Sidebar.css';

/**
 * Sidebar Component
 * Navigation sidebar for desktop
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { hasAnyRole, user, isAuthenticated } = useAuth();

  // Define all menu items with role requirements
  // Manager (MANAGER): All navigation links
  // Staff (STAFF): /menu, /orders, /attendance, /settings
  // Finance (FINANCE): /finance, /dashboard, /reports, /attendance, /settings
  // Barista (BARISTA): /orders, /attendance, /settings
  const allNavItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { path: ROUTES.ORDERS, label: 'Orders', icon: '🛒', roles: ['ADMIN', 'MANAGER', 'STAFF', 'BARISTA'] },
    { path: ROUTES.MENU, label: 'Menu', icon: '☕', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { path: ROUTES.INVENTORY, label: 'Inventory', icon: '📦', roles: ['ADMIN', 'MANAGER'] },
    { path: ROUTES.EMPLOYEES, label: 'Employees', icon: '👥', roles: ['ADMIN', 'MANAGER'] },
    { path: ROUTES.REPORTS, label: 'Reports', icon: '📈', roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { path: ROUTES.ATTENDANCE, label: 'Attendance', icon: '⏰', roles: ['ADMIN', 'MANAGER', 'FINANCE', 'STAFF', 'BARISTA'] },
    { path: ROUTES.FINANCE, label: 'Finance', icon: '💰', roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { path: ROUTES.SETTINGS, label: 'Settings', icon: '⚙️', roles: ['ADMIN', 'MANAGER', 'FINANCE', 'STAFF', 'BARISTA'] }
  ];

  // Filter items based on user roles - only show items user has access to
  // Show items if user is authenticated and has matching roles; use hasAnyRole for checks
  const navItems = isAuthenticated()
    ? allNavItems.filter(item => hasAnyRole(item.roles))
    : [];

  // Debug log if no items are shown for authenticated user
  if (isAuthenticated() && navItems.length === 0 && user) {
    console.warn('Sidebar: No menu items visible for user', { 
      username: user.username, 
      roles: user.roles,
      roleNames: user.roleNames 
    });
  }

  const adminItems = user && hasAnyRole(['ADMIN', 'MANAGER']) ? [
    { path: ROUTES.ADMIN, label: 'Employee Mgmt', icon: '👥' }
  ] : [];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar__overlay" onClick={onClose}></div>
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <nav className="sidebar__nav">
          <div className="sidebar__section">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
                onClick={onClose}
              >
                <span className="sidebar__icon">{item.icon}</span>
                <span className="sidebar__label">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {adminItems.length > 0 && (
            <div className="sidebar__section">
              <div className="sidebar__section-title">Management</div>
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="sidebar__icon">{item.icon}</span>
                  <span className="sidebar__label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default Sidebar;
