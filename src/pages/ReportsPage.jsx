import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { useApiMutation } from '../hooks/useApiMutation.jsx';
import { getAllOrders } from '../api/orderApi.jsx';
import { 
  getDailyReports, 
  getIngredientTransactions, 
  uploadReportFile, 
  getUploadedReports, 
  downloadReportFile 
} from '../api/reportApi.jsx';
import { getPaidSalaries } from '../api/salaryApi.jsx';
import Card from '../components/common/Card/index.jsx';
import RevenueChart from '../features/reports/RevenueChart.jsx';
import TransactionTable from '../features/reports/TransactionTable.jsx';
import DailyReportExport from '../features/reports/DailyReportExport.jsx';
import ReportUpload from '../features/reports/ReportUpload.jsx';
import ReportViewer from '../features/reports/ReportViewer.jsx';
import DateRangePicker from '../components/common/DateRangePicker/index.jsx';
import Button from '../components/common/Button/index.jsx';
import { formatCurrency, formatNumber, safeNumber } from '../utils/formatters.jsx';
import './ReportsPage.css';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, LabelList, CartesianGrid, Legend, Cell } from 'recharts';
import { ChartLineUp } from '@phosphor-icons/react';

const ReportsPage = () => {
  const { hasAnyRole } = useAuth();
  const isFinance = hasAnyRole(['FINANCE', 'ADMIN']);
  const isManager = hasAnyRole(['MANAGER', 'ADMIN', 'FINANCE']);

  const [activeTab, setActiveTab] = useState('revenue');
  
  // Default to yesterday
  const getDefaultReportDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };
  const [selectedDate, setSelectedDate] = useState(getDefaultReportDate());
  
  // Default range: last 30 days
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  
  // Queries
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useApiQuery(
    getAllOrders,
    { size: 10000 },
    []
  );
  const { data: reports, loading: reportsLoading } = useApiQuery(getDailyReports, {}, []);
  const { data: transactions, loading: transactionsLoading } = useApiQuery(getIngredientTransactions, {}, []);
  const { data: paidSalaries, loading: salariesLoading } = useApiQuery(getPaidSalaries, {}, []);
  
  // Uploaded Reports Query
  const { 
    data: uploadedReports, 
    loading: uploadedReportsLoading, 
    refetch: refetchUploadedReports 
  } = useApiQuery(getUploadedReports, {}, []);

  // Upload Mutation
  const { mutate: handleUploadReport } = useApiMutation(
    ({ file, metadata }) => uploadReportFile(file, metadata),
    {
      successMessage: 'Report uploaded successfully',
      onSuccess: () => refetchUploadedReports()
    }
  );

  // Download Handler
  const handleDownloadReport = async (reportId) => {
    try {
      await downloadReportFile(reportId);
    } catch (error) {
      console.error('Download failed:', error);
      // useApiMutation handles toast errors if we used it, but here just log or show toast
    }
  };

  useEffect(() => {
    if (ordersError) {
      console.error('Orders API Error:', ordersError);
    }
  }, [ordersError]);
  
  // Memoized Data Processing
  const allOrders = useMemo(() => ordersData?.content || ordersData || [], [ordersData]);
  const allUploadedReports = useMemo(() => uploadedReports?.content || uploadedReports || [], [uploadedReports]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];
    return allOrders.filter(order => {
      const orderStatus = (order.status || '').toString().toUpperCase();
      if (orderStatus !== 'COMPLETED') return false;
      const orderDate = new Date(order.orderDate);
      if (startDate && orderDate < startDate) return false;
      if (endDate) {
          const endAt = new Date(endDate);
          endAt.setHours(23, 59, 59, 999);
          if (orderDate > endAt) return false;
      }
      return true;
    });
  }, [allOrders, startDate, endDate]);
  
  // Filter daily reports
  const filteredDailyReports = useMemo(() => {
    if (!reports) return [];
    let filtered = [...reports];
    if (startDate) filtered = filtered.filter(r => new Date(r.reportDate) >= startDate);
    if (endDate) {
        const endAt = new Date(endDate);
        endAt.setHours(23, 59, 59, 999);
        filtered = filtered.filter(r => new Date(r.reportDate) <= endAt);
    }
    return filtered;
  }, [reports, startDate, endDate]);
  
  // Stats Calculation
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
    
    // Use filteredDailyReports length for daysInRange if available, else estimate
    const daysInRange = filteredDailyReports.length || 1; 
    const avgRevenuePerDay = daysInRange > 0 ? totalRevenue / daysInRange : 0;

    return { totalRevenue, totalOrders, avgOrderValue, avgRevenuePerDay, daysInRange };
  }, [filteredOrders, filteredDailyReports]);

  // Data preparation for charts (same as before)
  const dailyRevenue = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) return [];
    const revenueByDate = {};
    const costMap = {};
    (filteredDailyReports || []).forEach(r => {
      const key = r.reportDate;
      const costVal = typeof r.totalIngredientCost !== 'undefined' ? r.totalIngredientCost : r.totalCost;
      costMap[key] = typeof costVal === 'string' ? parseFloat(costVal) : costVal;
    });

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

    Object.keys(revenueByDate).forEach(date => {
      const cost = costMap[date];
      if (typeof cost !== 'undefined' && cost !== null && !isNaN(cost)) {
        revenueByDate[date].totalIngredientCost = cost;
      }
    });

    return Object.values(revenueByDate).sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate));
  }, [filteredOrders, filteredDailyReports]);

  const totalIngredientCost = useMemo(() => {
    if (!filteredDailyReports || filteredDailyReports.length === 0) return 0;
    return filteredDailyReports.reduce((sum, r) => {
      const raw = (typeof r.totalIngredientCost !== 'undefined' ? r.totalIngredientCost : r.totalCost) || 0;
      return sum + (typeof raw === 'string' ? parseFloat(raw) : raw);
    }, 0);
  }, [filteredDailyReports]);

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

  const breakdown = useMemo(() => {
    const revenue = safeNumber(stats.totalRevenue);
    const cogs = safeNumber(totalIngredientCost);
    const labor = safeNumber(totalSalaryCost);
    const net = revenue - cogs - labor;
    return { revenue, cogs, labor, net };
  }, [stats.totalRevenue, totalIngredientCost, totalSalaryCost]);

  const waterfallData = useMemo(() => {
    const { revenue, cogs, labor, net } = breakdown;
    const afterRevenue = revenue;
    const afterCogs = revenue + (-cogs);
    const afterLabor = afterCogs + (-labor);

    return [
      { name: 'Total Revenue', base: 0, delta: revenue, color: '#10b981', isTotal: false },
      { name: 'COGS', base: afterRevenue, delta: -cogs, color: '#ef4444', isTotal: false },
      { name: 'Labor', base: afterCogs, delta: -labor, color: '#ef4444', isTotal: false },
      { name: 'Net Profit', base: 0, delta: net, color: '#3b82f6', isTotal: true },
    ];
  }, [breakdown]);

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

  const selectedReport = useMemo(() => {
    const backendReport = reports?.find(r => r.reportDate === selectedDate);
    const ordersForDate = allOrders.filter(order => {
      const orderStatus = (order.status || '').toString().toUpperCase();
      const isCompleted = orderStatus === 'COMPLETED';
      const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
      return isCompleted && orderDate === selectedDate;
    });
    
    if (ordersForDate.length === 0 && !backendReport) return null;
    
    const totalRevenue = ordersForDate.reduce((sum, order) => {
      const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
      return sum + (amount || 0);
    }, 0);
    
    const totalIngredientCost = (backendReport?.totalIngredientCost ?? backendReport?.totalCost) || 0;
    const totalWorkingHours = backendReport?.totalWorkingHours || 0;
    
    return {
      reportDate: selectedDate,
      totalOrders: ordersForDate.length,
      totalRevenue,
      totalIngredientCost,
      totalWorkingHours,
      notes: backendReport?.notes || ''
    };
  }, [reports, selectedDate, allOrders]);

  const handleClearFilters = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
  };

  const CurrencyLabel = (props) => {
    const { x, y, width, value } = props;
    if (value == null) return null;
    const val = Number(value) || 0;
    return <text x={x + width + 6} y={y + 10} fill="#374151" fontSize={12}>{formatCurrency(val)}</text>;
  };

  const EmployeeTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 10, borderRadius: 6 }}>
          <div><strong>Employee:</strong> {d.name}</div>
          <div><strong>Avg. Order Value:</strong> {formatCurrency(d.avg)}</div>
          <div><strong>Total Orders:</strong> {d.count}</div>
          <div><strong>Total Revenue:</strong> {formatCurrency(d.total)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div className="page-header-content">
          <ChartLineUp size={32} weight="thin" className="page-header-icon" />
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">View business performance and transaction history</p>
          </div>
        </div>
      </div>

      {ordersError && (
        <div className="error-banner">
          <strong>⚠️ Error loading orders:</strong> {ordersError}
        </div>
      )}

      {/* Stats Cards */}
      {activeTab === 'revenue' && (
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
      )}

      {/* Date Filter */}
      {activeTab !== 'files' && (
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(start, end) => {
            setStartDate(start ? new Date(start).toISOString().split('T')[0] : '');
            setEndDate(end ? new Date(end).toISOString().split('T')[0] : '');
          }}
        />
      )}

      {/* Tabs */}
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
          className={`tab ${activeTab === 'files' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files & Uploads
        </button>
        <button
          className={`tab ${activeTab === 'export' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          Daily Report Export
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'revenue' && (
        <>
          <Card title="Daily Revenue" subtitle={`${dailyRevenue?.length || 0} days with completed orders`}>
            {ordersLoading ? (
              <div className="loading-container"><div className="loading"></div></div>
            ) : dailyRevenue.length === 0 ? (
              <div className="empty-state"><p>No completed orders found in the selected date range</p></div>
            ) : (
              <RevenueChart reports={dailyRevenue} />
            )}
          </Card>

          <Card title="Financial Breakdown (Waterfall)" subtitle="Revenue vs. COGS and Labor to Net Profit">
            {(ordersLoading || reportsLoading || salariesLoading) ? (
              <div className="loading-container"><div className="loading"></div></div>
            ) : (breakdown.revenue === 0 && breakdown.cogs === 0 && breakdown.labor === 0) ? (
              <div className="empty-state"><p>No data available</p></div>
            ) : (
              <div style={{ width: '100%', height: 360 }}>
                <ResponsiveContainer>
                  <ComposedChart data={waterfallData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="category" dataKey="name" />
                    <YAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="base" stackId="a" fill="transparent" />
                    <Bar dataKey="delta" stackId="a" name="Amount" isAnimationActive={false}>
                      <LabelList dataKey="delta" content={<CurrencyLabel />} />
                      {waterfallData.map((entry, idx) => <Cell key={`wcell-${idx}`} fill={entry.color} />)}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card title="Employee Performance (AOV)" subtitle="Average Order Value per Employee">
            {ordersLoading ? (
              <div className="loading-container"><div className="loading"></div></div>
            ) : employeePerf.length === 0 ? (
              <div className="empty-state"><p>No data available</p></div>
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

      {activeTab === 'files' && (
        <div className="files-section">
          {/* Manager/Finance/Admin can upload and view/download */}
          {isManager && (
            <Card title="Upload Report">
              <ReportUpload onUpload={(file, metadata) => handleUploadReport({ file, metadata })} />
            </Card>
          )}
          {isManager && (
            <Card title="Uploaded Reports">
              {uploadedReportsLoading ? (
                <div className="loading-container"><div className="loading"></div></div>
              ) : (
                <ReportViewer 
                  reports={allUploadedReports} 
                  onDownload={handleDownloadReport}
                  onPreview={(id) => console.log('Preview', id)} 
                />
              )}
            </Card>
          )}
        </div>
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
            <div className="loading-container"><div className="loading"></div></div>
          ) : (
            <DailyReportExport report={selectedReport} />
          )}
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
