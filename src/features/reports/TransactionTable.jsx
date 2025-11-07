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
const TransactionTable = ({ transactions, loading }) => {
  const [filterType, setFilterType] = useState('ALL');

  const filteredTransactions = filterType === 'ALL' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  const getTypeClass = (type) => {
    return type === TRANSACTION_TYPE.IMPORT ? 'type-import' : 'type-export';
  };

  const getTypeIcon = (type) => {
    return type === TRANSACTION_TYPE.IMPORT ? '↓' : '↑';
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
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
          All ({transactions.length})
        </button>
        <button
          className={`filter-chip ${filterType === TRANSACTION_TYPE.IMPORT ? 'active' : ''}`}
          onClick={() => setFilterType(TRANSACTION_TYPE.IMPORT)}
        >
          Import ({transactions.filter(t => t.type === TRANSACTION_TYPE.IMPORT).length})
        </button>
        <button
          className={`filter-chip ${filterType === TRANSACTION_TYPE.EXPORT ? 'active' : ''}`}
          onClick={() => setFilterType(TRANSACTION_TYPE.EXPORT)}
        >
          Export ({transactions.filter(t => t.type === TRANSACTION_TYPE.EXPORT).length})
        </button>
      </div>

      <div className="table-container">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Ingredient</th>
              <th>Employee</th>
              <th>Quantity</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  <span className={`type-badge ${getTypeClass(transaction.type)}`}>
                    <span className="type-icon">{getTypeIcon(transaction.type)}</span>
                    {transaction.type}
                  </span>
                </td>
                <td className="ingredient-name">{transaction.ingredientName || 'N/A'}</td>
                <td>{transaction.employeeName || 'N/A'}</td>
                <td className="quantity-cell">
                  {formatNumber(transaction.quantity, 2)}
                </td>
                <td>{formatDateTime(transaction.transactionDate)}</td>
              </tr>
            ))}
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
