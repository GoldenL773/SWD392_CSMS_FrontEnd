import React from 'react';
import { formatCurrency, formatDate } from '../../../utils/formatters.jsx';
import './OrderNotificationToast.css';

/**
 * Toast notification for new orders
 */
const OrderNotificationToast = ({ order, onClose, onClick }) => {
  if (!order) return null;

  return (
    <div className="order-notification-toast" onClick={onClick}>
      <div className="toast-header">
        <span className="toast-icon">🔔</span>
        <h4>New Order Received!</h4>
        <button className="toast-close" onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>
          ×
        </button>
      </div>
      <div className="toast-body">
        <div className="toast-info">
          <span className="toast-label">Order ID:</span>
          <span className="toast-value">#{order.id}</span>
        </div>
        <div className="toast-info">
          <span className="toast-label">Total:</span>
          <span className="toast-value toast-amount">{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="toast-info">
          <span className="toast-label">Time:</span>
          <span className="toast-value">{formatDate(order.orderDate)}</span>
        </div>
        {order.items && order.items.length > 0 && (
          <div className="toast-items">
            <span className="toast-label">Items:</span>
            <span className="toast-value">{order.items.length} item(s)</span>
          </div>
        )}
      </div>
      <div className="toast-footer">
        <span className="toast-hint">Click to view details</span>
      </div>
    </div>
  );
};

export default OrderNotificationToast;
