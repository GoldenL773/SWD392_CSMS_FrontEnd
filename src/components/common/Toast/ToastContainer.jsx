import React from 'react';
import PropTypes from 'prop-types';
import Toast from './index.jsx';
import './ToastContainer.css';

/**
 * ToastContainer Component
 * Container for rendering multiple toast notifications
 */
const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.string,
    duration: PropTypes.number
  })),
  onRemove: PropTypes.func.isRequired
};

export default ToastContainer;
