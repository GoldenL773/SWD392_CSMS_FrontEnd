import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters.jsx';
import { ORDER_STATUS } from '../../utils/constants.jsx';
import './OrdersTable.css';

/**
 * OrdersTable Component
 * Displays orders with expandable rows to show order items
 * Entity: Order (id, employee, orderDate, totalAmount, status, orderItems)
 * Entity: OrderItem (id, product, quantity, price)
 */
const OrdersTable = ({ orders, loading, onUpdateStatus }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (orderId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING: return 'status-pending';
      case ORDER_STATUS.PROCESSING: return 'status-processing';
      case ORDER_STATUS.COMPLETED: return 'status-completed';
      case ORDER_STATUS.CANCELLED: return 'status-cancelled';
      default: return '';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case ORDER_STATUS.PENDING: return ORDER_STATUS.PROCESSING;
      case ORDER_STATUS.PROCESSING: return ORDER_STATUS.COMPLETED;
      default: return null;
    }
  };

  const handleStatusUpdate = (e, orderId, newStatus) => {
    e.stopPropagation();
    if (onUpdateStatus) {
      onUpdateStatus(orderId, newStatus);
    }
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="table-empty">
        <p>No orders found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="orders-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}></th>
            <th>Order ID</th>
            <th>Employee</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <tr 
                className={`order-row ${expandedRows.has(order.id) ? 'expanded' : ''}`}
                onClick={() => toggleRow(order.id)}
              >
                <td className="expand-cell">
                  <button className="expand-btn">
                    {expandedRows.has(order.id) ? '▼' : '▶'}
                  </button>
                </td>
                <td className="order-id">#{order.id}</td>
                <td>{order.employeeName || order.employee?.fullName || 'N/A'}</td>
                <td>{formatDateTime(order.orderDate)}</td>
                <td className="amount-cell">{formatCurrency(order.totalAmount)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                  {getNextStatus(order.status) && (
                    <button
                      className="status-btn"
                      onClick={(e) => handleStatusUpdate(e, order.id, getNextStatus(order.status))}
                    >
                      → {getNextStatus(order.status)}
                    </button>
                  )}
                  {order.status === ORDER_STATUS.PENDING && (
                    <button
                      className="status-btn cancel-btn"
                      onClick={(e) => handleStatusUpdate(e, order.id, ORDER_STATUS.CANCELLED)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
              {expandedRows.has(order.id) && (
                <tr className="order-items-row">
                  <td colSpan="7">
                    <div className="order-items-container">
                      <h4>Order Items</h4>
                      <table className="order-items-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(order.items || order.orderItems)?.map((item) => (
                            <tr key={item.id}>
                              <td>{item.productName || item.product?.name || 'Unknown'}</td>
                              <td className="quantity-cell">{item.quantity}</td>
                              <td>{formatCurrency(item.price)}</td>
                              <td className="subtotal-cell">
                                {formatCurrency(item.subtotal || (item.quantity * item.price))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className="total-label">Total:</td>
                            <td className="total-amount">
                              {formatCurrency(order.totalAmount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

OrdersTable.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    employee: PropTypes.object,
    employeeName: PropTypes.string,
    orderDate: PropTypes.string.isRequired,
    totalAmount: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      productName: PropTypes.string,
      quantity: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
      subtotal: PropTypes.number
    })),
    orderItems: PropTypes.array // Fallback for old format
  })).isRequired,
  loading: PropTypes.bool,
  onUpdateStatus: PropTypes.func
};

export default OrdersTable;
