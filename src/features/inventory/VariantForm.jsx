import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../components/common/Modal/index.jsx';
import Button from '../../components/common/Button/index.jsx';
import './VariantForm.css';

/**
 * VariantForm Component
 * Form for adding new variants to existing products
 * 
 * Features:
 * - Modal form for variant input
 * - Form fields: size, temperature, price, SKU
 * - Form validation
 * - Handle form submission and add to variant list
 * - Update UI immediately after adding variant
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
const VariantForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  productId,
  productName,
  loading 
}) => {
  const [formData, setFormData] = useState({
    size: '',
    temperature: '',
    price: '',
    sku: ''
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        size: '',
        temperature: '',
        price: '',
        sku: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validate size
    if (!formData.size.trim()) {
      newErrors.size = 'Size is required';
    }

    // Validate price
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Prepare variant data
    const variantData = {
      productId,
      size: formData.size.trim(),
      temperature: formData.temperature.trim() || null,
      price: parseFloat(formData.price),
      sku: formData.sku.trim() || null
    };

    onSubmit(variantData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add New Variant - ${productName}`}
      size="medium"
    >
      <form className="variant-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="size">Size *</label>
          <input
            type="text"
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            placeholder="e.g., Small, Medium, Large"
            className={errors.size ? 'error' : ''}
            autoFocus
          />
          {errors.size && <span className="error-message">{errors.size}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="temperature">Temperature</label>
          <select
            id="temperature"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
          >
            <option value="">None</option>
            <option value="Hot">Hot</option>
            <option value="Cold">Cold</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (VND) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="1000"
            className={errors.price ? 'error' : ''}
          />
          {errors.price && <span className="error-message">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="sku">SKU</label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="SKU code (optional)"
          />
        </div>

        <div className="form-actions">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            loading={loading}
          >
            Add Variant
          </Button>
        </div>
      </form>
    </Modal>
  );
};

VariantForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  productName: PropTypes.string.isRequired,
  loading: PropTypes.bool
};

VariantForm.defaultProps = {
  loading: false
};

export default VariantForm;
