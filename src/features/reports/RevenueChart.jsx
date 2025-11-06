import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatDate } from '../../utils/formatters.jsx';
import './RevenueChart.css';

/**
 * RevenueChart Component
 * CSS-based bar chart for daily revenue
 * Entity: DailyReport (id, reportDate, totalOrders, totalRevenue, totalIngredientCost, totalWorkingHours)
 */
const RevenueChart = ({ reports }) => {
  if (!reports || reports.length === 0) {
    return (
      <div className="chart-empty">
        <p>No data available</p>
      </div>
    );
  }

  // Find max revenue for scaling
  const maxRevenue = Math.max(...reports.map(r => r.totalRevenue));

  return (
    <div className="revenue-chart">
      <div className="chart-bars">
        {reports.map((report) => {
          const heightPercent = (report.totalRevenue / maxRevenue) * 100;
          const profit = report.totalRevenue - report.totalIngredientCost;
          const profitMargin = ((profit / report.totalRevenue) * 100).toFixed(1);

          return (
            <div key={report.id} className="chart-bar-container">
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar"
                  style={{ height: `${heightPercent}%` }}
                  title={`Revenue: ${formatCurrency(report.totalRevenue)}`}
                >
                  <span className="bar-value">{formatCurrency(report.totalRevenue)}</span>
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
    id: PropTypes.number.isRequired,
    reportDate: PropTypes.string.isRequired,
    totalOrders: PropTypes.number.isRequired,
    totalRevenue: PropTypes.number.isRequired,
    totalIngredientCost: PropTypes.number.isRequired,
    totalWorkingHours: PropTypes.number.isRequired
  })).isRequired
};

export default RevenueChart;
