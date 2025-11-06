import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDateTime, formatNumber } from '../../utils/formatters.tsx';
import { TRANSACTION_TYPE } from '../../utils/constants.tsx';
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
                <td className="ingredient-name">{transaction.ingredient?.name || 'N/A'}</td>
                <td>{transaction.employee?.fullName || 'N/A'}</td>
                <td className="quantity-cell">
                  {formatNumber(transaction.quantity, 2)} {transaction.ingredient?.unit || ''}
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
    ingredient: PropTypes.object,
    employee: PropTypes.object,
    type: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    transactionDate: PropTypes.string.isRequired
  })).isRequired,
  loading: PropTypes.bool
};

export default TransactionTable;
