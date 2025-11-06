import React, { useMemo, useState, useCallback } from 'react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { getAllEmployees } from '../api/employeeApi.jsx';
import { getAllOrders } from '../api/orderApi.jsx';
import { getDailyReports } from '../api/reportApi.jsx';
import { 
  getPendingSalaries, 
  getPaidSalaries,
  calculateMonthlySalaries, 
  markSalaryAsPaid,
  markMultipleSalariesAsPaid,
  updateSalaryAdjustments
} from '../api/salaryApi.jsx';
import { ORDER_STATUS } from '../utils/constants.jsx';
import Card from '../components/common/Card/index.jsx';
import Button from '../components/common/Button/index.jsx';
import DateRangePicker from '../components/common/DateRangePicker/index.jsx';
import ToastContainer from '../components/common/Toast/ToastContainer.jsx';
import { formatCurrency, formatDate, safeNumber, formatPercentage } from '../utils/formatters.jsx';
import './FinancePage.css';

const FinancePage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // overview, salaries
  const [selectedSalaries, setSelectedSalaries] = useState([]);
  const [editingSalary, setEditingSalary] = useState(null);
  const [editFormData, setEditFormData] = useState({ bonus: 0, deductions: 0 });
  const [showPaidSalaries, setShowPaidSalaries] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  
  // Date range for financial period
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Current month/year for salary calculation
  const currentDate = new Date();
  const [salaryMonth, setSalaryMonth] = useState(currentDate.getMonth() + 1);
  const [salaryYear, setSalaryYear] = useState(currentDate.getFullYear());
  
  const { data: employees, loading: employeesLoading } = useApiQuery(getAllEmployees, { size: 1000 }, []);
  const { data: ordersData, loading: ordersLoading } = useApiQuery(getAllOrders, { size: 10000 }, []);
  const { data: reports, loading: reportsLoading } = useApiQuery(getDailyReports, {}, []);
  const { data: pendingSalaries, loading: salariesLoading, refetch: refetchSalaries } = useApiQuery(getPendingSalaries, {}, []);
  const { data: paidSalaries, loading: paidSalariesLoading, refetch: refetchPaidSalaries } = useApiQuery(getPaidSalaries, {}, []);
  
  // Mutations
  const { mutate: calculateSalaries, loading: calculating } = useApiMutation(calculateMonthlySalaries);
  const { mutate: markPaid, loading: marking } = useApiMutation(markSalaryAsPaid);
  const { mutate: markMultiplePaid, loading: markingMultiple } = useApiMutation(markMultipleSalariesAsPaid);
  
  // Extract orders from paginated response
  const allOrders = useMemo(() => {
    return ordersData?.content || ordersData || [];
  }, [ordersData]);

  // Calculate financial summary from completed orders in date range
  const financialSummary = useMemo(() => {
    if (!allOrders || allOrders.length === 0) {
      return { 
        totalRevenue: 0, 
        totalOrders: 0, 
        completedOrders: 0, 
        ingredientCost: 0,
        salaryCost: 0,
        totalCost: 0, 
        profit: 0, 
        profitMargin: 0 
      };
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
    
    // Calculate ingredient cost from reports in date range
    const ingredientCost = reports?.reduce((sum, r) => {
      const reportDate = new Date(r.reportDate).toISOString().split('T')[0];
      if (startDate && reportDate < startDate) return sum;
      if (endDate && reportDate > endDate) return sum;
      return sum + safeNumber(r.totalCost);
    }, 0) || 0;
    
    // Calculate salary cost from paid salaries in date range
    const salaryCost = paidSalaries?.reduce((sum, s) => {
      // Check if salary payment date is within range
      if (s.paymentDate) {
        const paymentDate = new Date(s.paymentDate).toISOString().split('T')[0];
        if (startDate && paymentDate < startDate) return sum;
        if (endDate && paymentDate > endDate) return sum;
        return sum + safeNumber(s.totalSalary);
      }
      return sum;
    }, 0) || 0;
    
    const totalCost = ingredientCost + salaryCost;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return { 
      totalRevenue, 
      totalOrders: allOrders.length,
      completedOrders: completedOrders.length,
      ingredientCost,
      salaryCost,
      totalCost, 
      profit, 
      profitMargin 
    };
  }, [allOrders, reports, paidSalaries, startDate, endDate]);

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
  
  // Handle calculate salaries
  const handleCalculateSalaries = useCallback(async () => {
    try {
      await calculateSalaries({ month: salaryMonth, year: salaryYear });
      toast.success(`Salaries calculated for ${salaryMonth}/${salaryYear}`);
      refetchSalaries();
    } catch (error) {
      toast.error(error.message || 'Failed to calculate salaries');
    }
  }, [salaryMonth, salaryYear, calculateSalaries, toast, refetchSalaries]);
  
  // Handle mark as paid
  const handleMarkAsPaid = useCallback(async (id) => {
    try {
      await markPaid(id);
      toast.success('Salary marked as paid');
      refetchSalaries();
    } catch (error) {
      toast.error(error.message || 'Failed to mark as paid');
    }
  }, [markPaid, toast, refetchSalaries]);
  
  // Handle process all payments
  const handleProcessAllPayments = useCallback(async () => {
    if (!pendingSalaries || pendingSalaries.length === 0) {
      toast.info('No pending salaries to process');
      return;
    }
    
    try {
      const ids = pendingSalaries.map(s => s.id);
      await markMultiplePaid(ids);
      toast.success(`Processed ${ids.length} salary payments`);
      refetchSalaries();
      setSelectedSalaries([]);
    } catch (error) {
      toast.error(error.message || 'Failed to process payments');
    }
  }, [pendingSalaries, markMultiplePaid, toast, refetchSalaries]);
  
  // Handle select salary
  const handleSelectSalary = (id) => {
    setSelectedSalaries(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };
  
  // Handle select all
  const handleSelectAll = () => {
    if (selectedSalaries.length === pendingSalaries?.length) {
      setSelectedSalaries([]);
    } else {
      setSelectedSalaries(pendingSalaries?.map(s => s.id) || []);
    }
  };
  
  // Handle edit salary
  const handleEditSalary = (salary) => {
    setEditingSalary(salary);
    setEditFormData({
      bonus: salary.bonus || 0,
      deductions: salary.deductions || 0
    });
  };
  
  // Handle save edit
  const handleSaveEdit = useCallback(async () => {
    if (!editingSalary) return;
    
    try {
      await updateSalaryAdjustments(editingSalary.id, {
        bonus: editFormData.bonus,
        deductions: editFormData.deductions,
        changedBy: 1 // TODO: Get from auth context
      });
      toast.success('Salary updated successfully');
      refetchSalaries();
      setEditingSalary(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update salary');
    }
  }, [editingSalary, editFormData, toast, refetchSalaries]);
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingSalary(null);
    setEditFormData({ bonus: 0, deductions: 0 });
  };
  
  // Display salaries based on filter
  const displayedSalaries = useMemo(() => {
    return showPaidSalaries ? (paidSalaries || []) : (pendingSalaries || []);
  }, [showPaidSalaries, paidSalaries, pendingSalaries]);

  return (
    <div className="finance-page">
      <div className="page-header">
        <h1>Finance Management</h1>
        <p>Financial overview and salary management</p>
      </div>
      
      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Financial Overview
        </button>
        <button 
          className={`tab ${activeTab === 'salaries' ? 'active' : ''}`}
          onClick={() => setActiveTab('salaries')}
        >
          Salary Management
        </button>
      </div>
      
      {activeTab === 'overview' && (
        <>
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
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setShowCostBreakdown(true)}>
          <div className="stat-label">Total Cost</div>
          <div className="stat-value">{formatCurrency(financialSummary.totalCost)}</div>
          <div className="stat-note">
            Ingredients: {formatCurrency(financialSummary.ingredientCost)} | 
            Salaries: {formatCurrency(financialSummary.salaryCost)}
          </div>
          <div className="stat-note" style={{ marginTop: '4px', color: 'var(--color-primary)' }}>
            Click for details
          </div>
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

        </>
      )}
      
      {activeTab === 'salaries' && (
        <>
          {/* Salary Calculation */}
          <Card title="Calculate Monthly Salaries">
            <div className="salary-calculation">
              <div className="calculation-inputs">
                <div className="input-group">
                  <label>Month</label>
                  <select value={salaryMonth} onChange={(e) => setSalaryMonth(parseInt(e.target.value))}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Year</label>
                  <input 
                    type="number" 
                    value={salaryYear} 
                    onChange={(e) => setSalaryYear(parseInt(e.target.value))}
                    min="2020"
                    max="2100"
                  />
                </div>
                <Button 
                  variant="primary" 
                  onClick={handleCalculateSalaries}
                  disabled={calculating}
                >
                  {calculating ? 'Calculating...' : 'Calculate Salaries'}
                </Button>
              </div>
              <p className="calculation-note">
                Calculate salaries for all active employees based on attendance records
              </p>
            </div>
          </Card>
          
          {/* Salary Payments */}
          <Card
            title={showPaidSalaries ? "Paid Salary History" : "Pending Salary Payments"}
            subtitle={showPaidSalaries 
              ? `${paidSalaries?.length || 0} paid salary record${(paidSalaries?.length || 0) !== 1 ? 's' : ''}`
              : `${pendingSalaries?.length || 0} pending payment${(pendingSalaries?.length || 0) !== 1 ? 's' : ''}`
            }
            actions={
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowPaidSalaries(!showPaidSalaries)}
                >
                  {showPaidSalaries ? 'Show Pending' : 'Show Paid History'}
                </Button>
                {!showPaidSalaries && (
                  <Button 
                    variant="primary" 
                    onClick={handleProcessAllPayments}
                    disabled={!pendingSalaries || pendingSalaries.length === 0 || markingMultiple}
                  >
                    {markingMultiple ? 'Processing...' : 'Process All Payments'}
                  </Button>
                )}
              </div>
            }
          >
            {(salariesLoading || paidSalariesLoading) ? (
              <div className="loading-container">
                <div className="loading"></div>
                <p>Loading salary data...</p>
              </div>
            ) : !displayedSalaries || displayedSalaries.length === 0 ? (
              <div className="empty-state">
                <p>{showPaidSalaries 
                  ? 'No paid salaries found.' 
                  : 'No pending salaries. Calculate salaries for the current month to get started.'
                }</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="salary-table">
                  <thead>
                    <tr>
                      {!showPaidSalaries && (
                        <th>
                          <input 
                            type="checkbox" 
                            checked={selectedSalaries.length === pendingSalaries?.length}
                            onChange={handleSelectAll}
                          />
                        </th>
                      )}
                      <th>Employee</th>
                      <th>Period</th>
                      <th>Base Salary</th>
                      <th>Bonus</th>
                      <th>Deductions</th>
                      <th>Total</th>
                      <th>Status</th>
                      {showPaidSalaries && <th>Payment Date</th>}
                      {!showPaidSalaries && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSalaries.map((salary) => (
                      <tr key={salary.id}>
                        {!showPaidSalaries && (
                          <td>
                            <input 
                              type="checkbox" 
                              checked={selectedSalaries.includes(salary.id)}
                              onChange={() => handleSelectSalary(salary.id)}
                            />
                          </td>
                        )}
                        <td className="employee-name">{salary.employeeName}</td>
                        <td>{salary.month}/{salary.year}</td>
                        <td>{formatCurrency(salary.baseSalary)}</td>
                        <td className="bonus-cell">{formatCurrency(salary.bonus || 0)}</td>
                        <td className="deduction-cell">{formatCurrency(salary.deductions || 0)}</td>
                        <td className="total-cell">{formatCurrency(salary.totalSalary)}</td>
                        <td>
                          <span className={`status-badge status-${salary.status.toLowerCase()}`}>
                            {salary.status}
                          </span>
                        </td>
                        {showPaidSalaries && (
                          <td>{salary.paymentDate ? formatDate(salary.paymentDate) : '-'}</td>
                        )}
                        {!showPaidSalaries && (
                          <td className="actions-cell">
                            <Button 
                              variant="ghost" 
                              size="small"
                              onClick={() => handleEditSalary(salary)}
                              disabled={marking}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="small"
                              onClick={() => handleMarkAsPaid(salary.id)}
                              disabled={marking}
                            >
                              {marking ? 'Processing...' : 'Mark Paid'}
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
      
      {/* Edit Salary Modal */}
      {editingSalary && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Salary Adjustments</h2>
              <button className="modal-close" onClick={handleCancelEdit}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Employee</label>
                <input type="text" value={editingSalary.employeeName} disabled />
              </div>
              <div className="form-group">
                <label>Period</label>
                <input type="text" value={`${editingSalary.month}/${editingSalary.year}`} disabled />
              </div>
              <div className="form-group">
                <label>Base Salary</label>
                <input type="text" value={formatCurrency(editingSalary.baseSalary)} disabled />
              </div>
              <div className="form-group">
                <label>Bonus</label>
                <input 
                  type="number" 
                  value={editFormData.bonus}
                  onChange={(e) => setEditFormData({...editFormData, bonus: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="1000"
                />
              </div>
              <div className="form-group">
                <label>Deductions</label>
                <input 
                  type="number" 
                  value={editFormData.deductions}
                  onChange={(e) => setEditFormData({...editFormData, deductions: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="1000"
                />
              </div>
              <div className="form-group">
                <label>New Total</label>
                <input 
                  type="text" 
                  value={formatCurrency(
                    editingSalary.baseSalary + editFormData.bonus - editFormData.deductions
                  )} 
                  disabled 
                />
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cost Breakdown Modal */}
      {showCostBreakdown && (
        <div className="modal-overlay" onClick={() => setShowCostBreakdown(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cost Breakdown</h2>
              <button className="modal-close" onClick={() => setShowCostBreakdown(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="cost-breakdown">
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span className="breakdown-icon" style={{ backgroundColor: '#f59e0b' }}>🥤</span>
                    <span>Ingredient Cost</span>
                  </div>
                  <div className="breakdown-value">{formatCurrency(financialSummary.ingredientCost)}</div>
                  <div className="breakdown-percentage">
                    {financialSummary.totalCost > 0 
                      ? `${((financialSummary.ingredientCost / financialSummary.totalCost) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span className="breakdown-icon" style={{ backgroundColor: '#3b82f6' }}>👥</span>
                    <span>Salary Cost</span>
                  </div>
                  <div className="breakdown-value">{formatCurrency(financialSummary.salaryCost)}</div>
                  <div className="breakdown-percentage">
                    {financialSummary.totalCost > 0 
                      ? `${((financialSummary.salaryCost / financialSummary.totalCost) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                </div>
                <div className="breakdown-divider"></div>
                <div className="breakdown-item breakdown-total">
                  <div className="breakdown-label">
                    <span>Total Cost</span>
                  </div>
                  <div className="breakdown-value">{formatCurrency(financialSummary.totalCost)}</div>
                  <div className="breakdown-percentage">100%</div>
                </div>
              </div>
              <div className="breakdown-note">
                <p><strong>Note:</strong> Ingredient costs are calculated from completed orders based on product recipes and ingredient prices. Salary costs include all paid salaries within the selected date range.</p>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="primary" onClick={() => setShowCostBreakdown(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};

export default FinancePage;
