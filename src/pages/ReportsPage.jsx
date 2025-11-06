import React, { useState } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getDailyReports, getIngredientTransactions } from '../api/reportApi.jsx';
import Card from '../components/common/Card/index.jsx';
import RevenueChart from '../features/reports/RevenueChart.jsx';
import TransactionTable from '../features/reports/TransactionTable.jsx';
import DailyReportExport from '../features/reports/DailyReportExport.jsx';
import DateRangePicker from '../components/common/DateRangePicker/index.jsx';
import { formatCurrency, formatNumber } from '../utils/formatters.jsx';
import './ReportsPage.css';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const { data: reports, loading: reportsLoading } = useApiQuery(getDailyReports, {}, []);
  const { data: transactions, loading: transactionsLoading } = useApiQuery(getIngredientTransactions, {}, []);

  // Filter reports by date range
  const filteredReports = React.useMemo(() => {
    if (!reports) return [];
    let filtered = [...reports];
    
    if (startDate) {
      filtered = filtered.filter(r => r.reportDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(r => r.reportDate <= endDate);
    }
    
    return filtered;
  }, [reports, startDate, endDate]);

  // Calculate summary stats
  const stats = React.useMemo(() => {
    if (!filteredReports || filteredReports.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, totalCost: 0, avgRevenue: 0 };
    }

    const totalRevenue = filteredReports.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalOrders = filteredReports.reduce((sum, r) => sum + r.totalOrders, 0);
    const totalCost = filteredReports.reduce((sum, r) => sum + r.totalIngredientCost, 0);
    const avgRevenue = totalRevenue / filteredReports.length;

    return { totalRevenue, totalOrders, totalCost, avgRevenue };
  }, [filteredReports]);

  // Get selected report for export
  const selectedReport = React.useMemo(() => {
    if (!reports) return null;
    return reports.find(r => r.reportDate === selectedDate);
  }, [reports, selectedDate]);

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>View business performance and transaction history</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{formatNumber(stats.totalOrders)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Cost</div>
          <div className="stat-value">{formatCurrency(stats.totalCost)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Revenue/Day</div>
          <div className="stat-value">{formatCurrency(stats.avgRevenue)}</div>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          label="Filter Reports by Date Range"
        />
      </Card>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'revenue' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue Chart
        </button>
        <button
          className={`tab ${activeTab === 'transactions' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`tab ${activeTab === 'export' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          Daily Report Export
        </button>
      </div>

      {activeTab === 'revenue' && (
        <Card title="Daily Revenue" subtitle={`${filteredReports.length} days performance`}>
          {reportsLoading ? (
            <div className="loading-container">
              <div className="loading"></div>
              <p>Loading reports...</p>
            </div>
          ) : (
            <RevenueChart reports={filteredReports} />
          )}
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card title="Ingredient Transactions" subtitle="Import and export history">
          <TransactionTable
            transactions={transactions || []}
            loading={transactionsLoading}
          />
        </Card>
      )}

      {activeTab === 'export' && (
        <Card>
          <div className="export-date-selector">
            <label htmlFor="export-date">Select Date for Report</label>
            <input
              type="date"
              id="export-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>
          {reportsLoading ? (
            <div className="loading-container">
              <div className="loading"></div>
              <p>Loading report...</p>
            </div>
          ) : (
            <DailyReportExport report={selectedReport} />
          )}
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
