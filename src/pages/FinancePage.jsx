import React, { useMemo, useState, useCallback, useContext, useEffect } from 'react';
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
import SalaryHistoryModal from '../components/salary/SalaryHistoryModal.jsx';
import EmployeeDetailModal from '../components/finance/EmployeeDetailModal.jsx';
import { AuthContext } from '../context/AuthProvider.jsx';

const FinancePage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // overview, salaries
  const [selectedSalaries, setSelectedSalaries] = useState([]);
  const [editingSalary, setEditingSalary] = useState(null);
  const [editFormData, setEditFormData] = useState({ bonus: 0, deductions: 0 });
  const [showPaidSalaries, setShowPaidSalaries] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historySalary, setHistorySalary] = useState(null);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState(null);

  // Sorting state
  const [sortKey, setSortKey] = useState('employeeName');
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };
  
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
  
  const { hasAnyRole } = useContext(AuthContext);
  const canViewEmployees = hasAnyRole(['ADMIN', 'MANAGER']);

  const { data: employees, loading: employeesLoading } = useApiQuery(
    getAllEmployees,
    { size: 1000 },
    [canViewEmployees],
    { enabled: canViewEmployees }
  );
  // Fetch all orders (FINANCE can now access for finance reports)
  const { data: ordersData, loading: ordersLoading } = useApiQuery(
    getAllOrders,
    { size: 10000 },
    []
  );
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
    let totalRevenue = 0;
    let completedOrdersCount = 0;
    let totalOrdersCount = 0;

    if (allOrders && allOrders.length > 0) {
      const completedOrders = allOrders.filter(order => {
        if (order.status !== ORDER_STATUS.COMPLETED) return false;
        const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;
        return true;
      });
      totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      completedOrdersCount = completedOrders.length;
      totalOrdersCount = allOrders.length;
    }

    // Ingredient cost from reports in date range
    const ingredientCost = (reports?.reduce((sum, r) => {
      const reportDate = new Date(r.reportDate).toISOString().split('T')[0];
      if (startDate && reportDate < startDate) return sum;
      if (endDate && reportDate > endDate) return sum;
      return sum + safeNumber(r.totalCost);
    }, 0)) || 0;

    // Salary cost from paid salaries in date range
    const salaryCost = (paidSalaries?.reduce((sum, s) => {
      if (s.paymentDate) {
        const paymentDate = new Date(s.paymentDate).toISOString().split('T')[0];
        if (startDate && paymentDate < startDate) return sum;
        if (endDate && paymentDate > endDate) return sum;
        return sum + safeNumber(s.totalSalary);
      }
      return sum;
    }, 0)) || 0;

    const totalCost = ingredientCost + salaryCost;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalOrders: totalOrdersCount,
      completedOrders: completedOrdersCount,
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
    const base = showPaidSalaries ? (paidSalaries || []) : (pendingSalaries || []);
    const arr = Array.isArray(base) ? [...base] : [];
    const dir = sortDir === 'asc' ? 1 : -1;
    const getVal = (row) => {
      switch (sortKey) {
        case 'employeeName': return (row.employeeName || '').toLowerCase();
        case 'baseSalary': return Number(row.baseSalary) || 0;
        case 'bonus': return Number(row.bonus) || 0;
        case 'deductions': return Number(row.deductions) || 0;
        case 'totalSalary': return Number(row.totalSalary) || 0;
        case 'status': return (row.status || '').toLowerCase();
        case 'paymentDate': return row.paymentDate || '';
        default: return (row.employeeName || '').toLowerCase();
      }
    };
    arr.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return (va > vb ? 1 : va < vb ? -1 : 0) * dir;
    });
    return arr;
  }, [showPaidSalaries, paidSalaries, pendingSalaries, sortKey, sortDir]);

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
                      <th onClick={() => handleSort('employeeName')} style={{cursor:'pointer'}}>Employee {sortKey==='employeeName' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                      <th>Period</th>
                      <th onClick={() => handleSort('baseSalary')} style={{cursor:'pointer'}}>Base {sortKey==='baseSalary' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                      <th onClick={() => handleSort('bonus')} style={{cursor:'pointer'}}>Bonus {sortKey==='bonus' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                      <th onClick={() => handleSort('deductions')} style={{cursor:'pointer'}}>Deductions {sortKey==='deductions' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                      <th onClick={() => handleSort('totalSalary')} style={{cursor:'pointer'}}>Total {sortKey==='totalSalary' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                      <th onClick={() => handleSort('status')} style={{cursor:'pointer'}}>Status {sortKey==='status' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                      {showPaidSalaries && (
                        <th onClick={() => handleSort('paymentDate')} style={{cursor:'pointer'}}>Payment Date {sortKey==='paymentDate' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                      )}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSalaries.map((salary) => (
                      <tr key={salary.id} onClick={() => { setDetailEmployee({ employeeId: salary.employeeId, employeeName: salary.employeeName }); setShowEmployeeDetail(true); }} style={{ cursor: 'pointer' }}>
                        {!showPaidSalaries && (
                          <td>
                            <input 
                              type="checkbox" 
                              checked={selectedSalaries.includes(salary.id)}
                              onClick={(e)=> e.stopPropagation()}
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
                        <td className="actions-cell">
                          {!showPaidSalaries && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleEditSalary(salary); }}
                                disabled={marking}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(salary.id); }}
                                disabled={marking}
                              >
                                {marking ? 'Processing...' : 'Mark Paid'}
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="small"
                            onClick={(e) => { e.stopPropagation(); setHistorySalary(salary); setShowHistory(true); }}
                          >
                            History
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          <SalaryHistoryModal open={showHistory} onClose={() => { setShowHistory(false); setHistorySalary(null); }} salary={historySalary} />
          <EmployeeDetailModal open={showEmployeeDetail} onClose={() => { setShowEmployeeDetail(false); setDetailEmployee(null); }} employee={detailEmployee} startDate={startDate} endDate={endDate} />
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
