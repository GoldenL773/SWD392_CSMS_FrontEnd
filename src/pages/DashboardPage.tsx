import React from 'react';
import { useApiQuery } from '../hooks/useApiQuery.tsx';
import { getDailyReports } from '../api/reportApi.tsx';
import { formatCurrency, formatNumber } from '../utils/formatters.tsx';
import './DashboardPage.css';

/**
 * DashboardPage Component
 * Main dashboard with business metrics and quick stats
 */
const DashboardPage = () => {
  const { data: reports, loading, error } = useApiQuery(getDailyReports, {}, []);

  const latestReport = reports && reports.length > 0 ? reports[0] : null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Welcome to Coffee Shop Management System</p>
      </div>

      {loading && (
        <div className="dashboard-loading">
          <div className="loading"></div>
          <p>Loading dashboard data...</p>
        </div>
      )}

      {error && (
        <div className="dashboard-error">
          <p>Error loading dashboard: {error}</p>
        </div>
      )}

      {latestReport && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3 className="stat-label">Total Orders</h3>
                <p className="stat-value">{formatNumber(latestReport.totalOrders)}</p>
                <span className="stat-date">Today</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3 className="stat-label">Total Revenue</h3>
                <p className="stat-value text-success">{formatCurrency(latestReport.totalRevenue)}</p>
                <span className="stat-date">Today</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3 className="stat-label">Ingredient Cost</h3>
                <p className="stat-value text-warning">{formatCurrency(latestReport.totalIngredientCost)}</p>
                <span className="stat-date">Today</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <h3 className="stat-label">Working Hours</h3>
                <p className="stat-value">{formatNumber(latestReport.totalWorkingHours, 1)} hrs</p>
                <span className="stat-date">Today</span>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <div className="dashboard-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                <a href="/orders" className="action-card">
                  <span className="action-icon">🛒</span>
                  <span className="action-label">New Order</span>
                </a>
                <a href="/inventory" className="action-card">
                  <span className="action-icon">📦</span>
                  <span className="action-label">Manage Inventory</span>
                </a>
                <a href="/employees" className="action-card">
                  <span className="action-icon">👥</span>
                  <span className="action-label">View Employees</span>
                </a>
                <a href="/reports" className="action-card">
                  <span className="action-icon">📈</span>
                  <span className="action-label">View Reports</span>
                </a>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-icon">✅</span>
                  <div className="activity-content">
                    <p className="activity-title">Daily report generated</p>
                    <span className="activity-time">Just now</span>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">🛒</span>
                  <div className="activity-content">
                    <p className="activity-title">{latestReport.totalOrders} orders completed</p>
                    <span className="activity-time">Today</span>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">💰</span>
                  <div className="activity-content">
                    <p className="activity-title">Revenue: {formatCurrency(latestReport.totalRevenue)}</p>
                    <span className="activity-time">Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
