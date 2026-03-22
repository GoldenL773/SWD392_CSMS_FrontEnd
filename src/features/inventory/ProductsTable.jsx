import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CaretDown, CaretRight, Plus, PencilSimple, Trash, Coffee, Cake, Hamburger, Martini, Bread, Package } from '@phosphor-icons/react';
import { formatCurrency } from '../../utils/formatters.jsx';
import { PRODUCT_STATUS } from '../../utils/constants.jsx';
import Button from '../../components/common/Button/index.jsx';
import './ProductsTable.css';

/**
 * ProductsTable Component
 * Displays products with variants expansion and CRUD operations
 * Entity: Product (id, name, category, price, status, variants)
 */
const ProductsTable = ({ 
  products, 
  onEdit, 
  onDelete,
  loading,
  sortField,
  sortDir,
  onSort
}) => {
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  
  const getCategoryIcon = (category) => {
    if (!category) return <Package size={24} />;
    const cat = category.toLowerCase();
    if (cat.includes('coffee')) return <Coffee size={24} />;
    if (cat.includes('cake') || cat.includes('dessert')) return <Cake size={24} />;
    if (cat.includes('food') || cat.includes('burger')) return <Hamburger size={24} />;
    if (cat.includes('drink') || cat.includes('beverage')) return <Martini size={24} />;
    if (cat.includes('bread') || cat.includes('pastry')) return <Bread size={24} />;
    return <Package size={24} />;
  };

  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const toggleExpand = (productId) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  // We only rely on server sorting now, no more client-side duplicate sorting
  const sortedProducts = products;

  const getStatusClass = (product) => {
    // Support both available (boolean) and status (string) field from backend
    const isAvailable = product.available !== undefined ? product.available : product.status === PRODUCT_STATUS.AVAILABLE;
    return isAvailable ? 'status-available' : 'status-unavailable';
  };

  const getStatusLabel = (product) => {
    if (product.status) return product.status;
    return product.available ? 'Available' : 'Unavailable';
  };

  const getCategory = (product) => {
    return product.categoryName || product.category || '—';
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
    <div className="table-container products-table-container">
      <table className="products-table">
        <thead>
          <tr>
            <th className="expand-col"></th>
            <th className="image-col">Image</th>
            <th onClick={() => handleSort('id')} className="sortable">
              ID {sortField === 'id' && (sortDir === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('name')} className="sortable">
              Name {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('category')} className="sortable">
              Category {sortField === 'category' && (sortDir === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('price')} className="sortable">
              Base Price {sortField === 'price' && (sortDir === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('status')} className="sortable">
              Status {sortField === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((product) => (
            <React.Fragment key={product.id}>
              <tr className={expandedProducts.has(product.id) ? 'row-expanded' : ''}>
                <td className="expand-col">
                  <button 
                    className="expand-btn"
                    onClick={() => toggleExpand(product.id)}
                    title="Toggle Variants"
                  >
                    {expandedProducts.has(product.id) ? (
                      <CaretDown size={16} weight="bold" />
                    ) : (
                      <CaretRight size={16} weight="bold" />
                    )}
                  </button>
                </td>
                <td className="image-cell">
                  {product.imageUrl && product.imageUrl !== 'null' ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="product-thumb" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.category-icon-placeholder-fallback');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {(!product.imageUrl || product.imageUrl === 'null') && (
                    <div className="product-thumb-placeholder category-icon-placeholder">
                      {getCategoryIcon(product.categoryName || product.category)}
                    </div>
                  )}
                  <div className="product-thumb-placeholder category-icon-placeholder category-icon-placeholder-fallback" style={{ display: 'none' }}>
                    {getCategoryIcon(product.categoryName || product.category)}
                  </div>
                </td>
                <td>{product.id}</td>
                <td className="product-name">
                  <div className="name-wrapper">
                    {product.name}
                    {product.variants?.length > 0 && (
                      <span className="variant-count-badge">
                        {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </td>
                <td>{getCategory(product)}</td>
                <td className="product-price">{formatCurrency(product.price)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(product)}`}>
                    {getStatusLabel(product)}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      className="btn-icon" 
                      onClick={() => onEdit(product)}
                      title="Add Variant / Edit"
                    >
                      <Plus size={18} weight="bold" />
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => onEdit(product)}
                      title="Edit Product"
                    >
                      <PencilSimple size={18} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      onClick={() => onDelete(product.id)}
                      title="Delete Product"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
              
              {expandedProducts.has(product.id) && (
                <tr className="variants-row">
                  <td colSpan="8">
                    <div className="variants-container">
                      <div className="variants-header">
                        <h4>Variants</h4>
                        <Button 
                          variant="ghost" 
                          size="small" 
                          onClick={() => onEdit(product)}
                        >
                          + Add Variant
                        </Button>
                      </div>
                      
                      {product.variants && product.variants.length > 0 ? (
                        <table className="variants-list-table">
                          <thead>
                            <tr>
                              <th>Size</th>
                              <th>Temp</th>
                              <th>Price</th>
                              <th>SKU</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.variants.map((variant, idx) => (
                              <tr key={variant.id || idx}>
                                <td>{variant.size}</td>
                                <td>{variant.temperature}</td>
                                <td>{formatCurrency(variant.price)}</td>
                                <td>{variant.sku || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="no-variants">No variants configured. Click "Add Variant" to create one.</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
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
    categoryName: PropTypes.string,
    category: PropTypes.string,
    price: PropTypes.number.isRequired,
    status: PropTypes.string,
    available: PropTypes.bool,
    variants: PropTypes.array
  })).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default ProductsTable;
