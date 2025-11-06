import React, { useState, useMemo } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllOrders } from '../api/orderApi.jsx';
import { getDailyReports, getIngredientTransactions } from '../api/reportApi.jsx';
import { ORDER_STATUS } from '../utils/constants.jsx';
import Card from '../components/common/Card/index.jsx';
import RevenueChart from '../features/reports/RevenueChart.jsx';
import TransactionTable from '../features/reports/TransactionTable.jsx';
import DailyReportExport from '../features/reports/DailyReportExport.jsx';
import DateRangePicker from '../components/common/DateRangePicker/index.jsx';
import Button from '../components/common/Button/index.jsx';
import { formatCurrency, formatNumber, safeNumber } from '../utils/formatters.jsx';
import './ReportsPage.css';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Set default date range to last 30 days
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Fetch all orders with large page size to get complete data
  const { data: ordersData, loading: ordersLoading } = useApiQuery(
    getAllOrders, 
    { size: 10000 }, 
    []
  );
  const { data: reports, loading: reportsLoading } = useApiQuery(getDailyReports, {}, []);
  const { data: transactions, loading: transactionsLoading } = useApiQuery(getIngredientTransactions, {}, []);
  
  // Extract orders from paginated response
  const allOrders = useMemo(() => {
    return ordersData?.content || ordersData || [];
  }, [ordersData]);

  // Filter orders by date range and status
  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];
    
    return allOrders.filter(order => {
      // Only include completed orders
      if (order.status !== ORDER_STATUS.COMPLETED) return false;
      
      const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
      
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      
      return true;
    });
  }, [allOrders, startDate, endDate]);
  
  // Group orders by date for chart
  const dailyRevenue = useMemo(() => {
    const revenueByDate = {};
    
    filteredOrders.forEach(order => {
      const date = new Date(order.orderDate).toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = {
          reportDate: date,
          totalRevenue: 0,
          totalOrders: 0
        };
      }
      revenueByDate[date].totalRevenue += order.totalAmount || 0;
      revenueByDate[date].totalOrders += 1;
    });
    
    return Object.values(revenueByDate).sort((a, b) => 
      new Date(a.reportDate) - new Date(b.reportDate)
    );
  }, [filteredOrders]);
  
  // Filter reports by date range (for daily report export)
  const filteredReports = useMemo(() => {
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

  // Calculate summary stats from completed orders
  const stats = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, daysInRange: 0 };
    }

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate days in range
    const daysInRange = dailyRevenue.length;
    const avgRevenuePerDay = daysInRange > 0 ? totalRevenue / daysInRange : 0;

    return { 
      totalRevenue, 
      totalOrders, 
      avgOrderValue, 
      avgRevenuePerDay,
      daysInRange 
    };
  }, [filteredOrders, dailyRevenue]);

  // Get selected report for export
  const selectedReport = useMemo(() => {
    if (!reports) return null;
    return reports.find(r => r.reportDate === selectedDate);
  }, [reports, selectedDate]);
  
  const handleClearFilters = () => {
    setStartDate(getDefaultStartDate());
    setEndDate(new Date().toISOString().split('T')[0]);
  };

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
          <div className="stat-note">From {stats.totalOrders} completed orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed Orders</div>
          <div className="stat-value">{formatNumber(stats.totalOrders)}</div>
          <div className="stat-note">In selected period</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Order Value</div>
          <div className="stat-value">{formatCurrency(stats.avgOrderValue)}</div>
          <div className="stat-note">Per order</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Revenue/Day</div>
          <div className="stat-value">{formatCurrency(stats.avgRevenuePerDay)}</div>
          <div className="stat-note">{stats.daysInRange} days</div>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <div className="filter-section">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            label="Filter Reports by Date Range"
          />
          <div className="filter-actions">
            <Button variant="secondary" onClick={handleClearFilters}>
              Reset to Last 30 Days
            </Button>
          </div>
        </div>
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
        <Card title="Daily Revenue" subtitle={`${dailyRevenue.length} days with completed orders`}>
          {ordersLoading ? (
            <div className="loading-container">
              <div className="loading"></div>
              <p>Loading revenue data...</p>
            </div>
          ) : dailyRevenue.length === 0 ? (
            <div className="empty-state">
              <p>No completed orders found in the selected date range</p>
            </div>
          ) : (
            <RevenueChart reports={dailyRevenue} />
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
