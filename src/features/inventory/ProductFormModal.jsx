import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useApiQuery } from '../../hooks/useApiQuery.jsx';
import { getAllIngredients } from '../../api/ingredientApi.jsx';
import Modal from '../../components/common/Modal/index.jsx';
import Button from '../../components/common/Button/index.jsx';
import { PRODUCT_CATEGORIES, PRODUCT_STATUS } from '../../utils/constants.jsx';
import './ProductFormModal.css';

/**
 * ProductFormModal Component
 * Form for creating/editing products with ingredient mappings
 * Entity: Product (name, category, price, status)
 * Entity: ProductIngredient (productId, ingredientId, quantityRequired)
 */
const ProductFormModal = ({ isOpen, onClose, onSubmit, product }) => {
  const { data: ingredients } = useApiQuery(getAllIngredients, {}, []);
  const [formData, setFormData] = useState({
    name: '',
    category: PRODUCT_CATEGORIES[0],
    price: '',
    status: PRODUCT_STATUS.AVAILABLE
  });
  const [productIngredients, setProductIngredients] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || PRODUCT_CATEGORIES[0],
        price: product.price?.toString() || '',
        status: product.status || PRODUCT_STATUS.AVAILABLE
      });
      setProductIngredients(product.productIngredients || []);
    } else {
      setFormData({
        name: '',
        category: PRODUCT_CATEGORIES[0],
        price: '',
        status: PRODUCT_STATUS.AVAILABLE
      });
      setProductIngredients([]);
    }
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const addIngredient = () => {
    setProductIngredients([...productIngredients, {
      ingredientId: ingredients?.[0]?.id || '',
      quantityRequired: ''
    }]);
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...productIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setProductIngredients(updated);
  };

  const removeIngredient = (index) => {
    setProductIngredients(productIngredients.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      productIngredients: productIngredients.map(pi => ({
        ingredientId: parseInt(pi.ingredientId),
        quantityRequired: parseFloat(pi.quantityRequired)
      })).filter(pi => pi.ingredientId && pi.quantityRequired > 0)
    };

    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      size="large"
    >
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Product Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
              <label htmlFor="price">Price (VND) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="1000"
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value={PRODUCT_STATUS.AVAILABLE}>Available</option>
                <option value={PRODUCT_STATUS.UNAVAILABLE}>Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Ingredient Requirements</h3>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={addIngredient}
            >
              + Add Ingredient
            </Button>
          </div>

          {productIngredients.length === 0 ? (
            <p className="empty-message">No ingredients added yet</p>
          ) : (
            <div className="ingredients-list">
              {productIngredients.map((pi, index) => (
                <div key={index} className="ingredient-row">
                  <select
                    value={pi.ingredientId}
                    onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                    className="ingredient-select"
                  >
                    {ingredients?.map(ing => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={pi.quantityRequired}
                    onChange={(e) => updateIngredient(index, 'quantityRequired', e.target.value)}
                    min="0"
                    step="0.01"
                    className="quantity-input"
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeIngredient(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

ProductFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  product: PropTypes.object
};

export default ProductFormModal;
