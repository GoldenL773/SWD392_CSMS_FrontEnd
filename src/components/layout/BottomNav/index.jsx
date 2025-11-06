import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants.jsx';
import './BottomNav.css';

/**
 * BottomNav Component
 * Bottom navigation for mobile devices
 */
const BottomNav = () => {
  const navItems = [
    { path: ROUTES.DASHBOARD, label: 'Home', icon: '🏠' },
    { path: ROUTES.ORDERS, label: 'Orders', icon: '🛒' },
    { path: ROUTES.INVENTORY, label: 'Inventory', icon: '📦' },
    { path: ROUTES.REPORTS, label: 'Reports', icon: '📈' }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`
          }
        >
          <span className="bottom-nav__icon">{item.icon}</span>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
