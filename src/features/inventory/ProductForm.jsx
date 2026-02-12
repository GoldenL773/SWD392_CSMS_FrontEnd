import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/common/Button/index.jsx';
import { PlusIcon, Trash } from 'phosphor-react';
import { PRODUCT_CATEGORIES, PRODUCT_STATUS } from '../../utils/constants.jsx';
import { generateId } from '../../utils/formatters.jsx';
import './ProductForm.css';

/**
 * ProductForm Component
 * Form for creating/editing products with variants
 * 
 * Features:
 * - General product information section (name, category, description, image)
 * - Variants table section (similar to ingredient import interface)
 * - Add/delete variant rows
 * - Form validation (product name required, at least one variant)
 * - Submit product and variants together
 * 
 * Requirements: 5.1, 5.2, 5.4, 5.5
 */
const ProductForm = ({ 
  product, 
  onSubmit, 
  onCancel,
  loading 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: PRODUCT_CATEGORIES[0],
    description: '',
    imageUrl: '',
    status: PRODUCT_STATUS.AVAILABLE
  });

  const [variants, setVariants] = useState([
    { 
      id: generateId(), 
      size: '', 
      temperature: '', 
      price: '', 
      sku: '' 
    }
  ]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        status: product.status
      });
      
      // Load existing variants if available
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants.map(v => ({
          id: v.id || generateId(),
          size: v.size || '',
          temperature: v.temperature || '',
          price: v.price ? v.price.toString() : '',
          sku: v.sku || ''
        })));
      }
    }
  }, [product]);

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

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
    
    // Clear variant errors
    if (errors.variants) {
      setErrors(prev => ({
        ...prev,
        variants: null
      }));
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { 
        id: generateId(), 
        size: '', 
        temperature: '', 
        price: '', 
        sku: '' 
      }
    ]);
  };

  const deleteVariant = (index) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validate product name
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    // Validate at least one variant
    if (variants.length === 0) {
      newErrors.variants = 'At least one variant is required';
    } else {
      // Validate each variant has required fields
      const hasInvalidVariant = variants.some(v => {
        return !v.size.trim() || !v.price || parseFloat(v.price) <= 0;
      });
      
      if (hasInvalidVariant) {
        newErrors.variants = 'All variants must have size and valid price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Prepare variants data
    const variantsData = variants.map(v => ({
      ...(v.id && typeof v.id === 'number' ? { id: v.id } : {}),
      size: v.size.trim(),
      temperature: v.temperature.trim() || null,
      price: parseFloat(v.price),
      sku: v.sku.trim() || null
    }));

    const submitData = {
      ...formData,
      variants: variantsData
    };

    if (product) {
      submitData.id = product.id;
    }

    onSubmit(submitData);
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      {/* General Product Information Section */}
      <div className="form-section">
        <h3 className="form-section-title">General Product Information</h3>
        
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {PRODUCT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Enter image URL"
          />
          {formData.imageUrl && (
            <div className="image-preview">
              <img src={formData.imageUrl} alt="Product preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value={PRODUCT_STATUS.AVAILABLE}>{PRODUCT_STATUS.AVAILABLE}</option>
            <option value={PRODUCT_STATUS.UNAVAILABLE}>{PRODUCT_STATUS.UNAVAILABLE}</option>
          </select>
        </div>
      </div>

      {/* Variants Section */}
      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">Product Variants *</h3>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={addVariant}
          >
            <PlusIcon size={16} weight="regular" />
            Add Variant
          </Button>
        </div>

        {errors.variants && (
          <div className="error-message section-error">{errors.variants}</div>
        )}

        <div className="variants-table-container">
          <table className="variants-table">
            <thead>
              <tr>
                <th>Size *</th>
                <th>Temperature</th>
                <th>Price (VND) *</th>
                <th>SKU</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr key={variant.id}>
                  <td>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      placeholder="e.g., Small, Medium, Large"
                      className="variant-input"
                    />
                  </td>
                  <td>
                    <select
                      value={variant.temperature}
                      onChange={(e) => handleVariantChange(index, 'temperature', e.target.value)}
                      className="variant-input"
                    >
                      <option value="">None</option>
                      <option value="Hot">Hot</option>
                      <option value="Cold">Cold</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="1000"
                      className="variant-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                      placeholder="SKU code"
                      className="variant-input"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-icon btn-delete"
                      onClick={() => deleteVariant(index)}
                      disabled={variants.length === 1}
                      title="Delete variant"
                    >
                      <Trash size={18} weight="regular" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="variants-help-text">
          At least one variant is required. Each variant must have a size and price.
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          loading={loading}
        >
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

ProductForm.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    category: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    status: PropTypes.string,
    variants: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      size: PropTypes.string,
      temperature: PropTypes.string,
      price: PropTypes.number,
      sku: PropTypes.string
    }))
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default ProductForm;
