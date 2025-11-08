import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { useApiQuery } from '../../../hooks/useApiQuery.jsx';
import { getAllOrders } from '../../../api/orderApi.jsx';
import { ORDER_STATUS, ROUTES } from '../../../utils/constants.jsx';
import ConfirmationModal from '../../common/ConfirmationModal/index.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import './Header.css';

/**
 * Header Component
 * Top navigation bar with logo and user menu
 */
const Header = ({ onMenuClick }) => {
  const { user, logout, hasAnyRole } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Fetch orders for notification count (only for Barista and Staff)
  const shouldFetchOrders = hasAnyRole(['BARISTA', 'STAFF', 'ADMIN', 'MANAGER']);
  const { data: ordersData, refetch } = useApiQuery(
    getAllOrders, 
    { size: 100 }, 
    [],
    { enabled: shouldFetchOrders }
  );
  
  // Auto-refresh orders for notification count
  React.useEffect(() => {
    if (!shouldFetchOrders) return;
    
    const intervalId = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [shouldFetchOrders, refetch]);

  // Count pending orders
  const pendingOrdersCount = useMemo(() => {
    const orders = ordersData?.content || ordersData || [];
    return orders.filter(order => order.status === ORDER_STATUS.PENDING).length;
  }, [ordersData]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutModal(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleNotificationClick = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  // Get recent orders for notification dropdown
  const recentOrders = useMemo(() => {
    const orders = ordersData?.content || ordersData || [];
    return orders
      .filter(order => order.status === ORDER_STATUS.PENDING)
      .slice(0, 10); // Show last 10 pending orders
  }, [ordersData]);

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
          {/* Notification Bell - Show for Barista, Staff, Admin, Manager */}
          {user && shouldFetchOrders && (
            <div className="header__notification-container">
              <button 
                className={`header__notification-btn ${showNotificationDropdown ? 'header__notification-btn--active' : ''}`}
                onClick={handleNotificationClick}
                title={`${pendingOrdersCount} pending order${pendingOrdersCount !== 1 ? 's' : ''}`}
              >
                🔔
                {pendingOrdersCount > 0 && (
                  <span className="header__notification-badge">
                    {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                  </span>
                )}
              </button>
              
              <NotificationDropdown 
                orders={recentOrders}
                isOpen={showNotificationDropdown}
                onClose={() => setShowNotificationDropdown(false)}
              />
            </div>
          )}
          
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
                onClick={handleLogoutClick}
                title="Logout"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will be redirected to the login page."
        confirmText="Logout"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={isLoggingOut}
      />
    </header>
  );
};

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired
};

export default Header;
