import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatters.jsx';
import './VariantList.css';

/**
 * VariantList Component
 * Displays product variants with their attributes
 * 
 * Features:
 * - Display variant size, temperature, and price
 * - Visual indication of availability
 * - Clickable variant items
 * 
 * Requirements: 4.2
 */
const VariantList = ({ variants, onVariantClick }) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  const handleVariantClick = (variant) => {
    if (onVariantClick) {
      onVariantClick(variant);
    }
  };

  return (
    <div className="variant-list">
      <div className="variant-list-header">
        <span className="variant-header-label">Available Variants</span>
      </div>
      <div className="variant-items">
        {variants.map((variant) => (
          <div
            key={variant.id}
            className={`variant-item ${variant.available === false ? 'unavailable' : ''}`}
            onClick={() => handleVariantClick(variant)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleVariantClick(variant);
              }
            }}
          >
            <div className="variant-attributes">
              {variant.size && (
                <div className="variant-attribute">
                  <span className="variant-label">Size:</span>
                  <span className="variant-value">{variant.size}</span>
                </div>
              )}
              
              {variant.temperature && (
                <div className="variant-attribute">
                  <span className="variant-label">Temperature:</span>
                  <span className="variant-value">{variant.temperature}</span>
                </div>
              )}
              
              <div className="variant-attribute variant-price">
                <span className="variant-label">Price:</span>
                <span className="variant-value price-value">
                  {formatCurrency(variant.price)}
                </span>
              </div>

              {variant.sku && (
                <div className="variant-attribute variant-sku">
                  <span className="variant-label">SKU:</span>
                  <span className="variant-value">{variant.sku}</span>
                </div>
              )}
            </div>

            {variant.available === false && (
              <div className="variant-status">
                <span className="status-badge unavailable">Unavailable</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

VariantList.propTypes = {
  variants: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    size: PropTypes.string,
    temperature: PropTypes.string,
    price: PropTypes.number.isRequired,
    sku: PropTypes.string,
    available: PropTypes.bool
  })).isRequired,
  onVariantClick: PropTypes.func
};

VariantList.defaultProps = {
  onVariantClick: null
};

export default VariantList;
