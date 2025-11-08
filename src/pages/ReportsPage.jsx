import React, { useState, useMemo, useEffect } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllOrders } from '../api/orderApi.jsx';
import { getDailyReports, getIngredientTransactions } from '../api/reportApi.jsx';
import { ORDER_STATUS, API_BASE_URL } from '../utils/constants.jsx';
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
  // Default to yesterday to catch orders from previous day
  const getDefaultReportDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1); // Yesterday
    return date.toISOString().split('T')[0];
  };
  const [selectedDate, setSelectedDate] = useState(getDefaultReportDate());
  
  // Set default date range to last 30 days
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Fetch all orders with large page size to get complete data
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useApiQuery(
    getAllOrders, 
    { size: 10000 }, 
    []
  );
  const { data: reports, loading: reportsLoading } = useApiQuery(getDailyReports, {}, []);
  const { data: transactions, loading: transactionsLoading } = useApiQuery(getIngredientTransactions, {}, []);
  
  // Log API errors only
  useEffect(() => {
    if (ordersError) {
      console.error('Orders API Error:', ordersError);
    }
  }, [ordersError]);
  
  // Extract orders from paginated response
  const allOrders = useMemo(() => {
    return ordersData?.content || ordersData || [];
  }, [ordersData]);

  // Filter orders by date range and status
  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];
    
    return allOrders.filter(order => {
      // Only include completed orders - handle any case variation
      const orderStatus = (order.status || '').toString().toUpperCase();
      const isCompleted = orderStatus === 'COMPLETED';
      
      if (!isCompleted) return false;
      
      const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
      
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      
      return true;
    });
  }, [allOrders, startDate, endDate]);
  
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
  
  // Group orders by date for chart
  const dailyRevenue = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];
    
    const revenueByDate = {};
    
    // Build cost map from backend daily reports (supports totalCost or totalIngredientCost)
    const costMap = {};
    (filteredReports || []).forEach(r => {
      const key = r.reportDate;
      const costVal = typeof r.totalIngredientCost !== 'undefined' ? r.totalIngredientCost : r.totalCost;
      costMap[key] = typeof costVal === 'string' ? parseFloat(costVal) : costVal;
    });
    
    // filteredOrders already has completed orders only
    filteredOrders.forEach(order => {
      const date = new Date(order.orderDate).toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = {
          id: date.replace(/-/g, ''), // Generate numeric-like id from date
          reportDate: date,
          totalRevenue: 0,
          totalOrders: 0,
          totalIngredientCost: 0,
          totalWorkingHours: 0
        };
      }
      // Ensure totalAmount is a number (backend might return string or number)
      const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
      revenueByDate[date].totalRevenue += amount || 0;
      revenueByDate[date].totalOrders += 1;
    });
    
    // Merge cost data into the corresponding dates
    Object.keys(revenueByDate).forEach(date => {
      const cost = costMap[date];
      if (typeof cost !== 'undefined' && cost !== null && !isNaN(cost)) {
        revenueByDate[date].totalIngredientCost = cost;
      }
    });
    
    return Object.values(revenueByDate).sort((a, b) => 
      new Date(a.reportDate) - new Date(b.reportDate)
    );
  }, [filteredOrders, filteredReports]);

  // Calculate summary stats from completed orders
  const stats = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, daysInRange: 0 };
    }

    // Ensure totalAmount is a number (backend might return string or number)
    const totalRevenue = filteredOrders.reduce((sum, order) => {
      const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
      return sum + (amount || 0);
    }, 0);
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

  // Get selected report for export - calculate from orders if not in backend
  const selectedReport = useMemo(() => {
    // First try to get from backend reports
    const backendReport = reports?.find(r => r.reportDate === selectedDate);
    
    // Otherwise, calculate from orders
    // Use ALL orders, not filteredOrders (which is filtered by date range)
    const ordersForDate = allOrders.filter(order => {
      const orderStatus = (order.status || '').toString().toUpperCase();
      const isCompleted = orderStatus === 'COMPLETED';
      const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
      const matchesDate = orderDate === selectedDate;
      
      return isCompleted && matchesDate;
    });
    
    
    if (ordersForDate.length === 0 && !backendReport) {
      return null;
    }
    
    // Calculate revenue from completed orders
    // Ensure totalAmount is a number (backend might return string or number)
    const totalRevenue = ordersForDate.reduce((sum, order) => {
      const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
      return sum + (amount || 0);
    }, 0);
    const totalOrders = ordersForDate.length;
    
    
    // Use backend values for cost/hours if available, otherwise 0
    const totalIngredientCost = (backendReport?.totalIngredientCost ?? backendReport?.totalCost) || 0;
    const totalWorkingHours = backendReport?.totalWorkingHours || 0;
    
    return {
      reportDate: selectedDate,
      totalOrders,
      totalRevenue,
      totalIngredientCost,
      totalWorkingHours,
      notes: backendReport?.notes || ''
    };
  }, [reports, selectedDate, allOrders]);
  
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

      {ordersError && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          padding: '16px',
          marginBottom: '20px',
          borderRadius: '8px',
          color: '#c00'
        }}>
          <strong>⚠️ Error loading orders:</strong> {ordersError}
          <br />
          <small>Check console for details. Backend server may be offline.</small>
        </div>
      )}

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
        <Card title="Daily Revenue" subtitle={`${dailyRevenue?.length || 0} days with completed orders`}>
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
