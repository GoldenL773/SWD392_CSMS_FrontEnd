import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatNumber } from '../../utils/formatters.jsx';
import { PencilSimple, Trash } from '@phosphor-icons/react';
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
      ? (Number(aValue) || 0) - (Number(bValue) || 0)
      : (Number(bValue) || 0) - (Number(aValue) || 0);
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
            <th onClick={() => handleSort('id')} className="sortable center-col">
              ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('name')} className="sortable">
              Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('unit')} className="sortable center-col">
              Unit {sortField === 'unit' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('currentStock')} className="sortable right-col">
              Quantity {sortField === 'currentStock' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('unitCost')} className="sortable right-col">
              Price/Unit {sortField === 'unitCost' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="right-col">Total Value</th>
            <th className="center-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedIngredients.map((ingredient) => (
            <tr key={ingredient.id}>
              <td className="center-col">{ingredient.id}</td>
              <td className="ingredient-name">{ingredient.name}</td>
              <td className="center-col">{ingredient.unit}</td>
              <td className="right-col">
                <span className={`quantity ${getStockStatus(ingredient.currentStock)}`}>
                  {formatNumber(ingredient.currentStock || 0, 2)}
                </span>
              </td>
              <td className="right-col price-cell">
                {formatCurrency(ingredient.unitCost || 0)}
              </td>
              <td className="right-col total-value">
                {formatCurrency((ingredient.currentStock || 0) * (ingredient.unitCost || 0))}
              </td>
              <td className="actions-cell">
                <div className="action-buttons">
                  <button 
                    className="btn-icon" 
                    onClick={() => onEdit(ingredient)}
                    title="Edit"
                  >
                    <PencilSimple size={18} />
                  </button>
                  <button 
                    className="btn-icon btn-danger" 
                    onClick={() => onDelete(ingredient.id)}
                    title="Delete"
                  >
                    <Trash size={18} />
                  </button>
                </div>
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
    currentStock: PropTypes.number,
    unitCost: PropTypes.number
  })).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default IngredientsTable;
