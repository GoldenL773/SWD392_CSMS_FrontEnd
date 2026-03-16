import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDateTime, formatNumber } from '../../utils/formatters.jsx';
import { TRANSACTION_TYPE } from '../../utils/constants.jsx';
import './TransactionTable.css';

/**
 * TransactionTable Component
 * Displays ingredient transactions
 * Entity: IngredientTransaction (id, ingredient, employee, type, quantity, transactionDate)
 */
const TransactionTable = ({ transactions = [], loading }) => {
  const [filterType, setFilterType] = useState('ALL');

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const filteredTransactions = filterType === 'ALL' 
    ? safeTransactions 
    : safeTransactions.filter(t => {
        const type = (t.type || t.transactionType)?.toUpperCase();
        if (filterType === TRANSACTION_TYPE.EXPORT) {
          return type === 'EXPORT' || type === 'USAGE';
        }
        return type === filterType.toUpperCase();
      });

  const getTypeClass = (type) => {
    return type?.toUpperCase() === 'IMPORT' ? 'type-import' : 'type-export';
  };

  const getTypeIcon = (type) => {
    return type?.toUpperCase() === 'IMPORT' ? '↓' : '↑';
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (safeTransactions.length === 0) {
    return (
      <div className="table-empty">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="transaction-table-container">
      <div className="transaction-filters">
        <button
          className={`filter-chip ${filterType === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterType('ALL')}
        >
          All ({safeTransactions.length})
        </button>
        <button
          className={`filter-chip ${filterType === TRANSACTION_TYPE.IMPORT ? 'active' : ''}`}
          onClick={() => setFilterType(TRANSACTION_TYPE.IMPORT)}
        >
          Import ({safeTransactions.filter(t => (t.type || t.transactionType)?.toUpperCase() === 'IMPORT').length})
        </button>
        <button
          className={`filter-chip ${filterType === TRANSACTION_TYPE.EXPORT ? 'active' : ''}`}
          onClick={() => setFilterType(TRANSACTION_TYPE.EXPORT)}
        >
          Export ({safeTransactions.filter(t => {
             const tp = (t.type || t.transactionType)?.toUpperCase();
             return tp === 'EXPORT' || tp === 'USAGE';
          }).length})
        </button>
      </div>

      <div className="table-container">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Ingredient</th>
              <th>Note / Employee</th>
              <th>Quantity</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => {
              const actualType = transaction.type || transaction.transactionType;
              const isImport = actualType?.toUpperCase() === 'IMPORT';
              return (
              <tr key={transaction.id}>
                <td>
                  <span className={`type-badge ${isImport ? 'type-import' : 'type-export'}`}>
                    <span className="type-icon">{isImport ? '↓' : '↑'}</span>
                    {actualType}
                  </span>
                </td>
                <td className="ingredient-name">{transaction.ingredientName || 'N/A'}</td>
                <td>
                  {transaction.note 
                    ? transaction.note.replace(/Recorded by user (\d+)/i, 'Employee #$1')
                    : (transaction.employeeName || '—')}
                </td>
                <td className="quantity-cell">
                  {formatNumber(transaction.quantity, 2)}
                </td>
                <td>{formatDateTime(transaction.transactionDate || transaction.createdAt)}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

TransactionTable.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    ingredientId: PropTypes.number,
    ingredientName: PropTypes.string,
    employeeId: PropTypes.number,
    employeeName: PropTypes.string,
    type: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    transactionDate: PropTypes.string.isRequired
  })).isRequired,
  loading: PropTypes.bool
};

export default TransactionTable;
