import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../hooks/useAuth.jsx';
import './Header.css';

/**
 * Header Component
 * Top navigation bar with logo and user menu
 */
const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      window.location.href = '/login';
    }
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          <button 
            className="header__menu-btn"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <span className="header__menu-icon"></span>
          </button>
          
          <div className="header__logo">
            <span className="header__logo-text">CSMS</span>
          </div>
        </div>

        <div className="header__right">
          {user && (
            <div className="header__user">
              <div className="header__user-info">
                <span className="header__user-name">{user.username}</span>
                {user.employee && (
                  <span className="header__user-role">{user.employee.position}</span>
                )}
              </div>
              
              <button 
                className="header__logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired
};

export default Header;
