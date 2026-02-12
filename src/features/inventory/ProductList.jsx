import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CaretDown, CaretUp } from 'phosphor-react';
import { formatCurrency } from '../../utils/formatters.jsx';
import VariantList from './VariantList.jsx';
import './ProductList.css';

/**
 * ProductList Component
 * Displays products with expandable variants
 * 
 * Features:
 * - Expandable product items for products with variants
 * - Expand/collapse icon indicator
 * - Display variant attributes (size, temperature, price)
 * - Handle products with no variants (no expansion)
 * - Rounded corners on product images
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 15.9
 */
const ProductList = ({ 
  products, 
  onProductClick,
  onVariantClick,
  loading 
}) => {
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  const toggleExpand = (productId) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const handleProductClick = (product) => {
    // Only toggle expansion if product has variants
    if (product.variants && product.variants.length > 0) {
      toggleExpand(product.id);
    }
    
    // Call parent handler if provided
    if (onProductClick) {
      onProductClick(product);
    }
  };

  if (loading) {
    return (
      <div className="product-list-loading">
        <div className="loading"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-list-empty">
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      {products.map((product) => {
        const hasVariants = product.variants && product.variants.length > 0;
        const isExpanded = expandedProducts.has(product.id);

        return (
          <div 
            key={product.id} 
            className={`product-item ${hasVariants ? 'has-variants' : ''} ${isExpanded ? 'expanded' : ''}`}
          >
            <div 
              className="product-header"
              onClick={() => handleProductClick(product)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleProductClick(product);
                }
              }}
            >
              {product.imageUrl && (
                <div className="product-image-container">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="product-image"
                  />
                </div>
              )}
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
                {!hasVariants && product.price && (
                  <p className="product-price">{formatCurrency(product.price)}</p>
                )}
              </div>

              {hasVariants && (
                <div className="expand-indicator">
                  {isExpanded ? (
                    <CaretUp size={24} weight="regular" />
                  ) : (
                    <CaretDown size={24} weight="regular" />
                  )}
                </div>
              )}
            </div>

            {hasVariants && isExpanded && (
              <VariantList 
                variants={product.variants}
                onVariantClick={onVariantClick}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

ProductList.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    price: PropTypes.number,
    variants: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      size: PropTypes.string,
      temperature: PropTypes.string,
      price: PropTypes.number.isRequired,
      sku: PropTypes.string,
      available: PropTypes.bool
    }))
  })).isRequired,
  onProductClick: PropTypes.func,
  onVariantClick: PropTypes.func,
  loading: PropTypes.bool
};

ProductList.defaultProps = {
  loading: false,
  onProductClick: null,
  onVariantClick: null
};

export default ProductList;
