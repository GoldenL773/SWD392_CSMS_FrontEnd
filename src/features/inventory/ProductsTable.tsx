import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatters.tsx';
import { PRODUCT_STATUS } from '../../utils/constants.tsx';
import Button from '../../components/common/Button/index.tsx';
import './ProductsTable.css';

/**
 * ProductsTable Component
 * Displays products with CRUD operations
 * Entity: Product (id, name, category, price, status)
 */
const ProductsTable = ({ 
  products, 
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

  const sortedProducts = [...products].sort((a, b) => {
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

  const getStatusClass = (status) => {
    return status === PRODUCT_STATUS.AVAILABLE ? 'status-available' : 'status-unavailable';
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="table-empty">
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="products-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')} className="sortable">
              ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('name')} className="sortable">
              Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('category')} className="sortable">
              Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('price')} className="sortable">
              Price {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('status')} className="sortable">
              Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td className="product-name">{product.name}</td>
              <td>{product.category}</td>
              <td className="product-price">{formatCurrency(product.price)}</td>
              <td>
                <span className={`status-badge ${getStatusClass(product.status)}`}>
                  {product.status}
                </span>
              </td>
              <td className="actions-cell">
                <Button 
                  variant="ghost" 
                  size="small"
                  onClick={() => onEdit(product)}
                >
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="small"
                  onClick={() => onDelete(product.id)}
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

ProductsTable.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired
  })).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default ProductsTable;
