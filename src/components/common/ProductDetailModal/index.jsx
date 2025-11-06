import React from 'react';
import PropTypes from 'prop-types';
import { useApiQuery } from '../../../hooks/useApiQuery.jsx';
import { getProductById } from '../../../api/productApi.jsx';
import Modal from '../Modal/index.jsx';
import { formatCurrency } from '../../../utils/formatters.jsx';
import './ProductDetailModal.css';

/**
 * ProductDetailModal Component
 * Displays detailed product information including ingredients
 */
const ProductDetailModal = ({ isOpen, onClose, productId }) => {
  const { data: product, loading } = useApiQuery(
    getProductById,
    productId,
    [productId],
    { enabled: isOpen && !!productId }
  );

  if (!isOpen || !productId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      size="medium"
    >
      {loading && (
        <div className="product-detail-loading">
          <div className="loading"></div>
          <p>Loading product details...</p>
        </div>
      )}

      {!loading && product && (
        <div className="product-detail-content">
          <div className="product-detail-header">
            <h2 className="product-name">{product.name}</h2>
            <span className="product-category">{product.category}</span>
          </div>

          <div className="product-detail-section">
            <div className="detail-row">
              <span className="detail-label">Price:</span>
              <span className="detail-value price">{formatCurrency(product.price)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status ${product.status?.toLowerCase()}`}>
                {product.status}
              </span>
            </div>
          </div>

          {product.description && (
            <div className="product-detail-section">
              <h3>Description</h3>
              <p className="product-description">{product.description}</p>
            </div>
          )}

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="product-detail-section">
              <h3>Ingredient Requirements</h3>
              <div className="ingredients-list">
                {product.ingredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-item">
                    <span className="ingredient-name">{ingredient.ingredientName || ingredient.name}</span>
                    <span className="ingredient-quantity">
                      {ingredient.quantityRequired || ingredient.quantity} {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!product.ingredients || product.ingredients.length === 0) && (
            <div className="product-detail-section">
              <p className="no-ingredients">No ingredient information available</p>
            </div>
          )}
        </div>
      )}

      {!loading && !product && (
        <div className="product-detail-error">
          <p>Product not found</p>
        </div>
      )}
    </Modal>
  );
};

ProductDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  productId: PropTypes.number
};

export default ProductDetailModal;
