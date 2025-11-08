import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatDate, safeNumber } from '../../utils/formatters.jsx';
import './RevenueChart.css';

/**
 * RevenueChart Component
 * CSS-based bar chart for daily revenue and orders
 * Entity: DailyReport (id, reportDate, totalOrders, totalRevenue, totalIngredientCost, totalWorkingHours)
 */
const RevenueChart = ({ reports }) => {
  const [chartMode, setChartMode] = useState('revenue'); // 'revenue' or 'orders'

  if (!reports || reports.length === 0) {
    return (
      <div className="chart-empty">
        <p>No data available</p>
      </div>
    );
  }

  // Find max values for scaling
  const maxRevenue = Math.max(...reports.map(r => safeNumber(r.totalRevenue)));
  const maxOrders = Math.max(...reports.map(r => safeNumber(r.totalOrders)));

  return (
    <div className="revenue-chart">
      {/* Chart Mode Toggle */}
      <div className="chart-mode-toggle">
        <button
          className={`mode-btn ${chartMode === 'revenue' ? 'mode-btn--active' : ''}`}
          onClick={() => setChartMode('revenue')}
        >
          💰 Revenue
        </button>
        <button
          className={`mode-btn ${chartMode === 'orders' ? 'mode-btn--active' : ''}`}
          onClick={() => setChartMode('orders')}
        >
          📦 Orders
        </button>
      </div>

      <div className="chart-bars">
        {reports.map((report) => {
          const revenue = safeNumber(report.totalRevenue);
          const orders = safeNumber(report.totalOrders);
          const cost = safeNumber(report.totalIngredientCost);
          
          // Calculate height based on selected mode
          const heightPercent = chartMode === 'revenue'
            ? (maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0)
            : (maxOrders > 0 ? (orders / maxOrders) * 100 : 0);
          
          const profit = revenue - cost;
          const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0.0';
          const displayValue = chartMode === 'revenue' ? revenue : orders;
          const displayLabel = chartMode === 'revenue' ? formatCurrency(revenue) : `${orders} orders`;

          return (
            <div key={report.id || report.reportDate} className="chart-bar-container">
              <div className="chart-bar-wrapper">
                <div 
                  className={`chart-bar chart-bar--${chartMode}`}
                  style={{ height: `${heightPercent}%`, ['--final-height']: `${heightPercent}%` }}
                  title={displayLabel}
                >
                  <span className="bar-value">{displayLabel}</span>
                </div>
              </div>
              <div className="chart-label">
                <div className="label-date">{formatDate(report.reportDate, 'short')}</div>
                <div className="label-stats">
                  <span className="stat-orders">{report.totalOrders} orders</span>
                  <span className={`stat-margin ${profit >= 0 ? 'positive' : 'negative'}`}>
                    {profitMargin}% margin
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

RevenueChart.propTypes = {
  reports: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    reportDate: PropTypes.string.isRequired,
    totalOrders: PropTypes.number.isRequired,
    totalRevenue: PropTypes.number.isRequired,
    totalIngredientCost: PropTypes.number,
    totalWorkingHours: PropTypes.number
  })).isRequired
};

export default RevenueChart;
