import React from 'react';
import PropTypes from 'prop-types';
import { ORDER_STATUS } from '../../utils/constants.tsx';
import './StatusFilter.css';

/**
 * StatusFilter Component
 * Filter buttons for order status
 */
const StatusFilter = ({ activeStatus, onStatusChange, orderCounts }) => {
  const statuses = [
    { value: 'ALL', label: 'All Orders' },
    { value: ORDER_STATUS.PENDING, label: 'Pending' },
    { value: ORDER_STATUS.COMPLETED, label: 'Completed' },
    { value: ORDER_STATUS.CANCELLED, label: 'Cancelled' }
  ];

  return (
    <div className="status-filter">
      {statuses.map((status) => (
        <button
          key={status.value}
          className={`filter-btn ${activeStatus === status.value ? 'filter-btn--active' : ''}`}
          onClick={() => onStatusChange(status.value)}
        >
          {status.label}
          {orderCounts[status.value] !== undefined && (
            <span className="count-badge">{orderCounts[status.value]}</span>
          )}
        </button>
      ))}
    </div>
  );
};

StatusFilter.propTypes = {
  activeStatus: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  orderCounts: PropTypes.object.isRequired
};

export default StatusFilter;
