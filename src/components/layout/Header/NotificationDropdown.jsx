import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../utils/formatters.jsx';
import './NotificationDropdown.css';

/**
 * NotificationDropdown Component
 * Displays recent order notifications in a dropdown menu
 */
const NotificationDropdown = ({ orders = [], isOpen, onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [readNotifications, setReadNotifications] = useState(new Set());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleNotificationClick = (order) => {
    // Mark as read
    setReadNotifications(prev => new Set(prev).add(order.id));
    
    // Navigate to order details or queue
    navigate(`/order-queue`);
    onClose();
  };

  const handleMarkAllAsRead = () => {
    const allIds = new Set(orders.map(order => order.id));
    setReadNotifications(allIds);
  };

  const unreadCount = orders.filter(order => !readNotifications.has(order.id)).length;

  return (
    <div 
      className={`notification-dropdown ${isOpen ? 'notification-dropdown--open' : ''}`}
      ref={dropdownRef}
    >
      <div className="notification-dropdown__header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button 
            className="notification-dropdown__mark-read"
            onClick={handleMarkAllAsRead}
            title="Mark all as read"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-dropdown__content">
        {orders.length === 0 ? (
          <div className="notification-dropdown__empty">
            <p>No notifications</p>
          </div>
        ) : (
          <ul className="notification-dropdown__list">
            {orders.map((order) => {
              const isRead = readNotifications.has(order.id);
              return (
                <li 
                  key={order.id}
                  className={`notification-item ${isRead ? 'notification-item--read' : 'notification-item--unread'}`}
                  onClick={() => handleNotificationClick(order)}
                >
                  <div className="notification-item__content">
                    <div className="notification-item__header">
                      <span className="notification-item__title">
                        Order #{order.id}
                      </span>
                      {!isRead && <span className="notification-item__unread-dot"></span>}
                    </div>
                    <div className="notification-item__details">
                      <span className="notification-item__status">
                        Status: {order.status}
                      </span>
                      <span className="notification-item__amount">
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="notification-item__time">
                      {formatDate(order.orderDate, 'time')}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

NotificationDropdown.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    totalAmount: PropTypes.number,
    orderDate: PropTypes.string.isRequired
  })),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default NotificationDropdown;
