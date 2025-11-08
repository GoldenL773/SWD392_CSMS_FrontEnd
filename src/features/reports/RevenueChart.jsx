import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts';
import { formatCurrency, formatDate, safeNumber } from '../../utils/formatters.jsx';
import './RevenueChart.css';

/**
 * RevenueChart Component
 * Recharts-based bar chart for daily revenue and orders
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

  // Format data for Recharts
  const chartData = useMemo(() => {
    return reports.map(report => ({
      date: formatDate(report.reportDate, 'short'),
      revenue: safeNumber(report.totalRevenue),
      orders: safeNumber(report.totalOrders),
      cost: safeNumber(report.totalIngredientCost),
      profit: safeNumber(report.totalRevenue) - safeNumber(report.totalIngredientCost),
      reportDate: report.reportDate
    }));
  }, [reports]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="recharts-tooltip">
          <p className="tooltip-date">{data.date}</p>
          <p className="tooltip-revenue">Revenue: {formatCurrency(data.revenue)}</p>
          <p className="tooltip-orders">Orders: {data.orders}</p>
          <p className="tooltip-cost">Cost: {formatCurrency(data.cost)}</p>
          <p className="tooltip-profit">Profit: {formatCurrency(data.profit)}</p>
        </div>
      );
    }
    return null;
  };

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

      {/* Recharts Chart */}
      <div className="recharts-container">
        <ResponsiveContainer width="100%" height={400}>
          {chartMode === 'revenue' ? (
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(184, 134, 11, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255, 255, 255, 0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.5)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="square"
              />
              <Bar 
                dataKey="revenue" 
                fill="#b8860b" 
                name="Revenue"
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="cost" 
                fill="#ef4444" 
                name="Cost"
                radius={[8, 8, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Profit"
                dot={{ fill: '#10b981', r: 4 }}
              />
            </ComposedChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(184, 134, 11, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255, 255, 255, 0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.5)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                dataKey="orders" 
                fill="#10b981" 
                name="Orders"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
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
