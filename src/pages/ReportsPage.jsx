import React, { useState, useMemo, useEffect, useContext } from 'react';
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
import { AuthContext } from '../context/AuthProvider.jsx';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, LabelList, CartesianGrid, Legend, Cell } from 'recharts';
import { getPaidSalaries } from '../api/salaryApi.jsx';

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
  
  // Fetch all orders (FINANCE can now access for reports)
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useApiQuery(
    getAllOrders,
    { size: 10000 },
    []
  );
  const { data: reports, loading: reportsLoading } = useApiQuery(getDailyReports, {}, []);
  const { data: transactions, loading: transactionsLoading } = useApiQuery(getIngredientTransactions, {}, []);
  const { data: paidSalaries, loading: salariesLoading } = useApiQuery(getPaidSalaries, {}, []);
  
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
          id: date.replace(/-/g, ''),
          reportDate: date,
          totalRevenue: 0,
          totalOrders: 0,
          totalIngredientCost: 0,
          totalWorkingHours: 0
        };
      }
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

    return Object.values(revenueByDate).sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate));
  }, [filteredOrders, filteredReports]);

  // Calculate summary stats from completed orders (placed before breakdown to avoid TDZ)
  const stats = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, daysInRange: 0, avgRevenuePerDay: 0 };
    }

    const totalRevenue = filteredOrders.reduce((sum, order) => {
      const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
      return sum + (amount || 0);
    }, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const daysInRange = dailyRevenue.length;
    const avgRevenuePerDay = daysInRange > 0 ? totalRevenue / daysInRange : 0;

    return { totalRevenue, totalOrders, avgOrderValue, avgRevenuePerDay, daysInRange };
  }, [filteredOrders, dailyRevenue]);

  // Sum ingredient cost across filtered reports (COGS)
  const totalIngredientCost = useMemo(() => {
    if (!filteredReports || filteredReports.length === 0) return 0;
    return filteredReports.reduce((sum, r) => {
      const raw = (typeof r.totalIngredientCost !== 'undefined' ? r.totalIngredientCost : r.totalCost) || 0;
      return sum + (typeof raw === 'string' ? parseFloat(raw) : raw);
    }, 0);
  }, [filteredReports]);

  // Sum salary cost from paid salaries within date range
  const totalSalaryCost = useMemo(() => {
    if (!paidSalaries || paidSalaries.length === 0) return 0;
    return paidSalaries.reduce((sum, s) => {
      if (!s.paymentDate) return sum;
      const date = new Date(s.paymentDate).toISOString().split('T')[0];
      if (startDate && date < startDate) return sum;
      if (endDate && date > endDate) return sum;
      return sum + safeNumber(s.totalSalary);
    }, 0);
  }, [paidSalaries, startDate, endDate]);

  // Financial breakdown values
  const breakdown = useMemo(() => {
    const revenue = safeNumber(stats.totalRevenue);
    const cogs = safeNumber(totalIngredientCost);
    const labor = safeNumber(totalSalaryCost);
    const net = revenue - cogs - labor;
    return { revenue, cogs, labor, net };
  }, [stats.totalRevenue, totalIngredientCost, totalSalaryCost]);

  // Build data for Waterfall chart using stacked bars (base + delta)
  const waterfallData = useMemo(() => {
    const { revenue, cogs, labor, net } = breakdown;
    // previous cumulative values to position the next bar
    const afterRevenue = revenue;
    const afterCogs = revenue + (-cogs);
    // Labor cost is negative; cumulative after labor
    const afterLabor = afterCogs + (-labor);

    return [
      { name: 'Total Revenue', base: 0, delta: revenue, color: '#10b981', isTotal: false },
      { name: 'COGS', base: afterRevenue, delta: -cogs, color: '#ef4444', isTotal: false },
      { name: 'Labor', base: afterCogs, delta: -labor, color: '#ef4444', isTotal: false },
      { name: 'Net Profit', base: 0, delta: net, color: '#3b82f6', isTotal: true },
    ];
  }, [breakdown]);

  // Employee performance (AOV per employee) data
  const employeePerf = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];
    const map = new Map();
    filteredOrders.forEach(order => {
      const key = order.employeeId || order.employeeName || 'Unknown';
      const name = order.employeeName || `Employee ${order.employeeId}`;
      const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount || 0;
      if (!map.has(key)) map.set(key, { name, total: 0, count: 0 });
      const obj = map.get(key);
      obj.total += amount;
      obj.count += 1;
    });
    const arr = Array.from(map.values()).map(o => ({
      name: o.name,
      avg: o.count > 0 ? o.total / o.count : 0,
      count: o.count,
      total: o.total,
    }));
    arr.sort((a, b) => b.avg - a.avg);
    return arr;
  }, [filteredOrders]);

  // Custom label for currency on bars
  const CurrencyLabel = (props) => {
    const { x, y, width, value } = props;
    if (value == null) return null;
    const val = Number(value) || 0;
    const posX = (x || 0) + (width || 0) + 6;
    const posY = (y || 0) + 10;
    return (
      <text x={posX} y={posY} fill="#374151" fontSize={12}>{formatCurrency(val)}</text>
    );
  };

  // Enhanced tooltip for employee performance
  const EmployeeTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 10, borderRadius: 6 }}>
          <div><strong>Employee:</strong> {d.name}</div>
          <div><strong>Avg. Order Value:</strong> {formatCurrency(d.avg)}</div>
          <div><strong>Total Orders in Period:</strong> {d.count}</div>
          <div><strong>Total Revenue in Period:</strong> {formatCurrency(d.total)}</div>
        </div>
      );
    }
    return null;
  };

  

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
        <>
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

          <Card title="Financial Breakdown (Waterfall)" subtitle="Revenue vs. COGS and Labor to Net Profit">
            {(ordersLoading || reportsLoading || salariesLoading) ? (
              <div className="loading-container">
                <div className="loading"></div>
                <p>Loading financial breakdown...</p>
              </div>
            ) : (breakdown.revenue === 0 && breakdown.cogs === 0 && breakdown.labor === 0) ? (
              <div className="empty-state">
                <p>No data available for the selected period</p>
              </div>
            ) : (
              <div style={{ width: '100%', height: 360 }}>
                <ResponsiveContainer>
                  <ComposedChart data={waterfallData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="category" dataKey="name" />
                    <YAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    {/* Base (invisible) to position deltas */}
                    <Bar dataKey="base" stackId="a" fill="transparent" />
                    {/* Delta bar, colored per bar using Cells */}
                    <Bar dataKey="delta" stackId="a" name="Amount" isAnimationActive={false}>
                      <LabelList dataKey="delta" content={<CurrencyLabel />} />
                      {waterfallData.map((entry, idx) => (
                        <Cell key={`wcell-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card title="Employee Performance (AOV)" subtitle="Average Order Value per Employee">
            {ordersLoading ? (
              <div className="loading-container">
                <div className="loading"></div>
                <p>Loading employee performance...</p>
              </div>
            ) : employeePerf.length === 0 ? (
              <div className="empty-state">
                <p>No data available for the selected period</p>
              </div>
            ) : (
              <div style={{ width: '100%', height: 420 }}>
                <ResponsiveContainer>
                  <ComposedChart data={employeePerf} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                    <YAxis type="category" dataKey="name" width={140} />
                    <Tooltip content={<EmployeeTooltip />} />
                    <Legend />
                    <Bar dataKey="avg" name="Average Order Value" fill="#82ca9d">
                      <LabelList dataKey="avg" content={<CurrencyLabel />} />
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </>
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
