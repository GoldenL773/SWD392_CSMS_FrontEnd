import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatNumber } from '../../utils/formatters.jsx';
import Button from '../../components/common/Button/index.jsx';
import './IngredientsTable.css';

/**
 * IngredientsTable Component
 * Displays ingredients with CRUD operations
 * Entity: Ingredient (id, name, unit, quantity, pricePerUnit)
 */
const IngredientsTable = ({ 
  ingredients, 
  onEdit, 
  onDelete,
  loading 
}) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedIngredients = [...ingredients].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? aValue - bValue
      : bValue - aValue;
  });

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity < 10) return 'low-stock';
    return 'in-stock';
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading"></div>
        <p>Loading ingredients...</p>
      </div>
    );
  }

  if (ingredients.length === 0) {
    return (
      <div className="table-empty">
        <p>No ingredients found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="ingredients-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')} className="sortable">
              ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('name')} className="sortable">
              Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('unit')} className="sortable">
              Unit {sortField === 'unit' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('quantity')} className="sortable">
              Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('pricePerUnit')} className="sortable">
              Price/Unit {sortField === 'pricePerUnit' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th>Total Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedIngredients.map((ingredient) => (
            <tr key={ingredient.id}>
              <td>{ingredient.id}</td>
              <td className="ingredient-name">{ingredient.name}</td>
              <td>{ingredient.unit}</td>
              <td>
                <span className={`quantity ${getStockStatus(ingredient.quantity)}`}>
                  {formatNumber(ingredient.quantity, 2)}
                </span>
              </td>
              <td className="price-cell">{formatCurrency(ingredient.pricePerUnit)}</td>
              <td className="total-value">
                {formatCurrency(ingredient.quantity * ingredient.pricePerUnit)}
              </td>
              <td className="actions-cell">
                <Button 
                  variant="ghost" 
                  size="small"
                  onClick={() => onEdit(ingredient)}
                >
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="small"
                  onClick={() => onDelete(ingredient.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

IngredientsTable.propTypes = {
  ingredients: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    pricePerUnit: PropTypes.number.isRequired
  })).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default IngredientsTable;
