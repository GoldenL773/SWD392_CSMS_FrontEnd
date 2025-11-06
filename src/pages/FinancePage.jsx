import React, { useMemo, useState } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllEmployees } from '../api/employeeApi.jsx';
import { getAllOrders } from '../api/orderApi.jsx';
import { getDailyReports } from '../api/reportApi.jsx';
import { ORDER_STATUS } from '../utils/constants.jsx';
import Card from '../components/common/Card/index.jsx';
import Button from '../components/common/Button/index.jsx';
import DateRangePicker from '../components/common/DateRangePicker/index.jsx';
import { formatCurrency, formatDate, safeNumber, formatPercentage } from '../utils/formatters.jsx';
import './FinancePage.css';

const FinancePage = () => {
  // Date range for financial period
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { data: employees, loading: employeesLoading } = useApiQuery(getAllEmployees, { size: 1000 }, []);
  const { data: ordersData, loading: ordersLoading } = useApiQuery(getAllOrders, { size: 10000 }, []);
  const { data: reports, loading: reportsLoading } = useApiQuery(getDailyReports, {}, []);
  
  // Extract orders from paginated response
  const allOrders = useMemo(() => {
    return ordersData?.content || ordersData || [];
  }, [ordersData]);

  // Calculate financial summary from completed orders in date range
  const financialSummary = useMemo(() => {
    if (!allOrders || allOrders.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, completedOrders: 0, totalCost: 0, profit: 0, profitMargin: 0 };
    }

    // Filter completed orders within date range
    const completedOrders = allOrders.filter(order => {
      if (order.status !== ORDER_STATUS.COMPLETED) return false;
      
      const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      
      return true;
    });

    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalCost = reports?.reduce((sum, r) => sum + safeNumber(r.totalCost), 0) || 0;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return { 
      totalRevenue, 
      totalOrders: allOrders.length,
      completedOrders: completedOrders.length,
      totalCost, 
      profit, 
      profitMargin 
    };
  }, [allOrders, reports, startDate, endDate]);

  // Active employees for salary management
  const activeEmployees = useMemo(() => {
    return (employees?.content || employees || []).filter(emp => 
      emp.status === 'ACTIVE' || emp.status === 'Active'
    );
  }, [employees]);
  
  const handleClearFilters = () => {
    setStartDate(getDefaultStartDate());
    setEndDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="finance-page">
      <div className="page-header">
        <h1>Finance Management</h1>
        <p>Financial overview and salary management</p>
      </div>
      
      {/* Date Range Filter */}
      <Card>
        <div className="filter-section">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            label="Financial Period"
          />
          <div className="filter-actions">
            <Button variant="secondary" onClick={handleClearFilters}>
              Reset to Current Month
            </Button>
          </div>
        </div>
      </Card>

      <div className="finance-stats">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatCurrency(financialSummary.totalRevenue)}</div>
          <div className="stat-note">From {financialSummary.completedOrders} completed orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Cost</div>
          <div className="stat-value">{formatCurrency(financialSummary.totalCost)}</div>
          <div className="stat-note">Operational expenses</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Profit</div>
          <div className={`stat-value ${financialSummary.profit >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(financialSummary.profit)}
          </div>
          <div className="stat-note">Revenue - Cost</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Profit Margin</div>
          <div className={`stat-value ${financialSummary.profitMargin >= 0 ? 'positive' : 'negative'}`}>
            {formatPercentage(financialSummary.profitMargin)}
          </div>
          <div className="stat-note">Profitability ratio</div>
        </div>
      </div>

      <Card
        title="Active Employees"
        subtitle={`${activeEmployees.length} active employee${activeEmployees.length !== 1 ? 's' : ''}`}
      >
        {employeesLoading || ordersLoading ? (
          <div className="loading-container">
            <div className="loading"></div>
            <p>Loading employee data...</p>
          </div>
        ) : activeEmployees.length === 0 ? (
          <div className="empty-state">
            <p>No active employees found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="salary-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Position</th>
                  <th>Hire Date</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="employee-name">{employee.fullName}</td>
                    <td>{employee.position}</td>
                    <td>{formatDate(employee.hireDate)}</td>
                    <td>{employee.phone}</td>
                    <td>
                      <span className="status-badge status-active">{employee.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FinancePage;
