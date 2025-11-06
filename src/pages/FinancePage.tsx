import React, { useMemo } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.tsx';
import { getAllEmployees } from '../api/employeeApi.tsx';
import { getDailyReports } from '../api/reportApi.tsx';
import Card from '../components/common/Card/index.tsx';
import Button from '../components/common/Button/index.tsx';
import { formatCurrency, formatDate } from '../utils/formatters.tsx';
import './FinancePage.css';

const FinancePage = () => {
  const { data: employees, loading: employeesLoading } = useApiQuery(getAllEmployees, {}, []);
  const { data: reports, loading: reportsLoading } = useApiQuery(getDailyReports, {}, []);

  const financialSummary = useMemo(() => {
    if (!reports || reports.length === 0) {
      return { totalRevenue: 0, totalCost: 0, profit: 0, profitMargin: 0 };
    }

    const totalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalCost = reports.reduce((sum, r) => sum + r.totalIngredientCost, 0);
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalCost, profit, profitMargin };
  }, [reports]);

  // Mock salary data for demonstration
  const pendingSalaries = employees?.filter(emp => emp.status === 'ACTIVE').map(emp => ({
    employeeId: emp.id,
    employeeName: emp.fullName,
    position: emp.position,
    baseSalary: 10000000, // Mock value
    bonus: 1000000,
    deduction: 0,
    totalSalary: 11000000,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'PENDING'
  })) || [];

  return (
    <div className="finance-page">
      <div className="page-header">
        <h1>Finance Management</h1>
        <p>Financial overview and salary management</p>
      </div>

      <div className="finance-stats">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatCurrency(financialSummary.totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Cost</div>
          <div className="stat-value">{formatCurrency(financialSummary.totalCost)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Profit</div>
          <div className={`stat-value ${financialSummary.profit >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(financialSummary.profit)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Profit Margin</div>
          <div className={`stat-value ${financialSummary.profitMargin >= 0 ? 'positive' : 'negative'}`}>
            {financialSummary.profitMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      <Card
        title="Salary Payouts"
        subtitle={`${pendingSalaries.length} pending payment${pendingSalaries.length !== 1 ? 's' : ''}`}
        actions={
          <Button variant="primary">Process All Payments</Button>
        }
      >
        {employeesLoading ? (
          <div className="loading-container">
            <div className="loading"></div>
            <p>Loading salary data...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="salary-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Position</th>
                  <th>Period</th>
                  <th>Base Salary</th>
                  <th>Bonus</th>
                  <th>Deduction</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingSalaries.map((salary) => (
                  <tr key={salary.employeeId}>
                    <td className="employee-name">{salary.employeeName}</td>
                    <td>{salary.position}</td>
                    <td>{salary.month}/{salary.year}</td>
                    <td>{formatCurrency(salary.baseSalary)}</td>
                    <td className="bonus-cell">{formatCurrency(salary.bonus)}</td>
                    <td className="deduction-cell">{formatCurrency(salary.deduction)}</td>
                    <td className="total-cell">{formatCurrency(salary.totalSalary)}</td>
                    <td>
                      <span className="status-badge status-pending">{salary.status}</span>
                    </td>
                    <td className="actions-cell">
                      <Button variant="ghost" size="small">Pay</Button>
                      <Button variant="ghost" size="small">Edit</Button>
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
