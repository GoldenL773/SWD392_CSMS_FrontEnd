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
const OrdersTable = ({ orders, loading, onUpdateStatus, sortField, sortDir, onSort }) => {
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

  // Avoid duplicate client sorting if server is taking care of it,
  // but we can retain it as a fallback if needed. In this case, simply use orders array.
  const sortedOrders = orders;

  return (
    <div className="table-container orders-table-container">
      <table className="orders-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}></th>
            <th onClick={() => onSort?.('id')} className="sortable">
              Order ID {sortField === 'id' && (sortDir === 'ASC' ? '↑' : '↓')}
            </th>
            <th>Employee</th>
            <th onClick={() => onSort?.('orderDate')} className="sortable">
              Date {sortField === 'orderDate' && (sortDir === 'ASC' ? '↑' : '↓')}
            </th>
            <th onClick={() => onSort?.('totalAmount')} className="sortable">
              Total Amount {sortField === 'totalAmount' && (sortDir === 'ASC' ? '↑' : '↓')}
            </th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => (
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
                      CANCEL
                    </button>
                  )}
                </td>
              </tr>
              {expandedRows.has(order.id) && (
                <>
                  <tr className="order-items-section-title">
                    <td></td>
                    <td colSpan="6">Order Items</td>
                  </tr>
                  <tr className="order-items-subheader">
                    <td></td>
                    <td colSpan="3">Product</td>
                    <td className="align-center">Quantity</td>
                    <td colSpan="2" className="align-right">Subtotal</td>
                  </tr>
                  {(order.items || order.orderItems)?.map((item) => (
                    <tr key={`${order.id}-${item.id}`} className="order-item-detail-row">
                      <td></td>
                      <td colSpan="3" className="item-product-cell">
                        {item.productName || item.product?.name || 'Unknown'}
                      </td>
                      <td className="quantity-cell align-center">{item.quantity}</td>
                      <td colSpan="2" className="subtotal-cell align-right">
                        {formatCurrency(item.subtotal || (item.quantity * item.price))}
                      </td>
                    </tr>
                  ))}
                  <tr className="order-items-total-row">
                    <td></td>
                    <td colSpan="4" className="total-label">Total:</td>
                    <td colSpan="2" className="total-amount align-right">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

OrdersTable.propTypes = {
  orders: PropTypes.array,
  loading: PropTypes.bool,
  onUpdateStatus: PropTypes.func,
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
  onSort: PropTypes.func
};

export default OrdersTable;
