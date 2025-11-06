import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatters.tsx';
import './SalaryView.css';

/**
 * SalaryView Component
 * Displays salary information
 * Entity: Salary (id, month, year, baseSalary, bonus, deduction, totalSalary, status)
 */
const SalaryView = ({ salary, loading }) => {
  const getStatusClass = (status) => {
    return status === 'PAID' ? 'status-paid' : 'status-pending';
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading"></div>
        <p>Loading salary...</p>
      </div>
    );
  }

  if (salary.length === 0) {
    return (
      <div className="table-empty">
        <p>No salary records found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="salary-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Base Salary</th>
            <th>Bonus</th>
            <th>Deduction</th>
            <th>Total Salary</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {salary.map((record) => (
            <tr key={record.id}>
              <td className="period-cell">
                {record.month}/{record.year}
              </td>
              <td>{formatCurrency(record.baseSalary)}</td>
              <td className="bonus-cell">
                {record.bonus > 0 ? `+${formatCurrency(record.bonus)}` : '-'}
              </td>
              <td className="deduction-cell">
                {record.deduction > 0 ? `-${formatCurrency(record.deduction)}` : '-'}
              </td>
              <td className="total-cell">
                {formatCurrency(record.totalSalary)}
              </td>
              <td>
                <span className={`status-badge ${getStatusClass(record.status)}`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

SalaryView.propTypes = {
  salary: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired,
    baseSalary: PropTypes.number.isRequired,
    bonus: PropTypes.number.isRequired,
    deduction: PropTypes.number.isRequired,
    totalSalary: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired
  })).isRequired,
  loading: PropTypes.bool
};

export default SalaryView;
