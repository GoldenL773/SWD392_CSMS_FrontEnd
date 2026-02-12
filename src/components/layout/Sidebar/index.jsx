import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ROUTES } from '../../../utils/constants.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import {
  HomeIcon,
  OrderIcon,
  MenuIcon,
  RecipeIcon,
  ProductIcon,
  SupplierIcon,
  EmployeeIcon,
  PaymentIcon,
  ReportIcon,
  FinanceIcon,
  AttendanceIcon,
  SettingsIcon
} from '../../../utils/icons.js';
import './Sidebar.css';

/**
 * Sidebar Component
 * Navigation sidebar for desktop
 * Updated to consolidate navigation items and apply Visual Design System
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { hasAnyRole, user, isAuthenticated } = useAuth();

  // Define all menu items with role requirements
  // Manager (MANAGER): All navigation links
  // Staff (STAFF): /menu, /orders, /attendance, /settings
  // Finance (FINANCE): /finance, /dashboard, /reports, /attendance, /settings
  // Barista (BARISTA): /orders, /recipes, /attendance, /settings
  const allNavItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', Icon: HomeIcon, roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { path: ROUTES.ORDERS, label: 'Orders', Icon: OrderIcon, roles: ['ADMIN', 'MANAGER', 'STAFF', 'BARISTA'] },
    { path: ROUTES.MENU, label: 'Menu', Icon: MenuIcon, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { path: ROUTES.RECIPES, label: 'Recipes', Icon: RecipeIcon, roles: ['ADMIN', 'MANAGER', 'BARISTA'] },
    { path: ROUTES.INVENTORY, label: 'Inventory', Icon: ProductIcon, roles: ['ADMIN', 'MANAGER'] },
    { path: ROUTES.SUPPLIERS, label: 'Suppliers', Icon: SupplierIcon, roles: ['ADMIN', 'MANAGER'] },
    { path: ROUTES.EMPLOYEES, label: 'Employees', Icon: EmployeeIcon, roles: ['ADMIN', 'MANAGER'] },
    { path: ROUTES.PAYMENT, label: 'Payment', Icon: PaymentIcon, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { path: ROUTES.REPORTS, label: 'Reports', Icon: ReportIcon, roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { path: ROUTES.FINANCE, label: 'Finance', Icon: FinanceIcon, roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { path: ROUTES.ATTENDANCE, label: 'Attendance', Icon: AttendanceIcon, roles: ['ADMIN', 'MANAGER', 'FINANCE', 'STAFF', 'BARISTA'] },
    { path: ROUTES.SETTINGS, label: 'Settings', Icon: SettingsIcon, roles: ['ADMIN', 'MANAGER', 'FINANCE', 'STAFF', 'BARISTA'] }
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

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar__overlay" onClick={onClose}></div>
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <nav className="sidebar__nav">
          <div className="sidebar__section">
            {navItems.map((item) => {
              const IconComponent = item.Icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="sidebar__icon">
                    <IconComponent size={24} weight="regular" />
                  </span>
                  <span className="sidebar__label">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
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
