import React, { useState, useMemo } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllOrders } from '../api/orderApi.jsx';
import { formatCurrency } from '../utils/formatters.jsx';
import { CreditCard, Receipt, CalendarBlank } from '@phosphor-icons/react';
import './PaymentPage.css';

/**
 * PaymentPage – Transaction History
 * Shows completed orders filterable by Day / Week / Month
 */
const PaymentPage = () => {
  const [periodFilter, setPeriodFilter] = useState('day'); // day | week | month
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: ordersData, loading } = useApiQuery(
    getAllOrders,
    { page, size: pageSize, status: 'COMPLETED', sortBy: 'orderDate', sortDir: 'DESC' },
    [page]
  );

  const orders = ordersData?.content || ordersData || [];
  const totalElements = ordersData?.totalElements ?? orders.length;
  const totalPages = ordersData?.totalPages ?? Math.ceil(totalElements / pageSize);

  // Client-side filter by period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(order => {
      const d = new Date(order.orderDate || order.createdAt);
      if (periodFilter === 'day') {
        return d.toDateString() === now.toDateString();
      } else if (periodFilter === 'week') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      } else {
        // month
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
    });
  }, [orders, periodFilter]);

  const totalForPeriod = filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div className="payment-page">
      <div className="page-header">
        <div className="page-header-content">
          <CreditCard size={32} weight="thin" className="page-header-icon" />
          <div>
            <h1 className="page-title">Transaction History</h1>
            <p className="page-subtitle">View completed payments</p>
          </div>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="payment-period-tabs">
        {[
          { key: 'day',   label: 'Today' },
          { key: 'week',  label: 'This Week' },
          { key: 'month', label: 'This Month' }
        ].map(p => (
          <button
            key={p.key}
            className={`period-tab ${periodFilter === p.key ? 'period-tab--active' : ''}`}
            onClick={() => { setPeriodFilter(p.key); setPage(0); }}
          >
            <CalendarBlank size={16} weight="regular" />
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Card */}
      <div className="payment-summary">
        <div className="summary-card">
          <Receipt size={28} weight="thin" />
          <div>
            <p className="summary-label">Transactions</p>
            <p className="summary-value">{filteredOrders.length}</p>
          </div>
        </div>
        <div className="summary-card summary-card--highlight">
          <CreditCard size={28} weight="thin" />
          <div>
            <p className="summary-label">Total Revenue</p>
            <p className="summary-value">{formatCurrency(totalForPeriod)}</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="payment-table-wrapper">
        {loading ? (
          <div className="loading-container"><div className="loading" /><p>Loading transactions...</p></div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state"><p>No completed transactions found for this period.</p></div>
        ) : (
          <table className="payment-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date & Time</th>
                <th>Cashier</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>
                  <td>{order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : '—'}</td>
                  <td>{order.employeeName || order.employee?.fullName || '—'}</td>
                  <td>{(order.items || order.orderItems || []).length} item(s)</td>
                  <td className="order-amount">{formatCurrency(order.totalAmount || 0)}</td>
                  <td><span className="status-badge status-completed">{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="btn-page"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >Previous</button>
          <span className="page-info">Page {page + 1} of {totalPages}</span>
          <button
            className="btn-page"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1}
          >Next</button>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
