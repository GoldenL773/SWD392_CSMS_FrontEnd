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
  const { hasAnyRole, user } = useAuth();

  // Define all menu items with role requirements
  // STAFF: Orders, Finance, Settings
  // ADMIN/MANAGER: All items
  // FINANCE: Dashboard, Reports, Finance, Settings
  const allNavItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { path: ROUTES.ORDERS, label: 'Orders', icon: '🛒', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { path: ROUTES.MENU, label: 'Menu', icon: '☕', roles: ['ADMIN', 'MANAGER'] },
    { path: ROUTES.INVENTORY, label: 'Inventory', icon: '📦', roles: ['ADMIN', 'MANAGER'] },
    { path: ROUTES.EMPLOYEES, label: 'Employees', icon: '👥', roles: ['ADMIN', 'MANAGER'] },
    { path: ROUTES.REPORTS, label: 'Reports', icon: '📈', roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { path: ROUTES.FINANCE, label: 'Finance', icon: '💰', roles: ['ADMIN', 'MANAGER', 'FINANCE', 'STAFF'] },
    { path: ROUTES.SETTINGS, label: 'Settings', icon: '⚙️', roles: ['ADMIN', 'MANAGER', 'FINANCE', 'STAFF'] }
  ];

  // Filter items based on user roles - show all if no user or no roles
  const navItems = user && user.roles && user.roles.length > 0
    ? allNavItems.filter(item => hasAnyRole(item.roles))
    : allNavItems; // Show all items if not logged in or no roles

  const adminItems = hasAnyRole(['ADMIN']) ? [
    { path: ROUTES.ADMIN, label: 'Admin', icon: '🔐' }
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
