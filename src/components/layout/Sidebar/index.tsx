import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ROUTES } from '../../../utils/constants.tsx';
import { useAuth } from '../../../hooks/useAuth.tsx';
import './Sidebar.css';

/**
 * Sidebar Component
 * Navigation sidebar for desktop
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { hasAnyRole } = useAuth();

  const navItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { path: ROUTES.ORDERS, label: 'Orders', icon: '🛒' },
    { path: ROUTES.INVENTORY, label: 'Inventory', icon: '📦' },
    { path: ROUTES.EMPLOYEES, label: 'Employees', icon: '👥' },
    { path: ROUTES.REPORTS, label: 'Reports', icon: '📈' },
    { path: ROUTES.SETTINGS, label: 'Settings', icon: '⚙️' }
  ];

  const adminItems = [
    { path: ROUTES.ADMIN, label: 'Admin', icon: '🔐' },
    { path: ROUTES.FINANCE, label: 'Finance', icon: '💰' }
  ];

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

          {hasAnyRole(['ROLE_ADMIN', 'ROLE_MANAGER']) && (
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
