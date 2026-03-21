import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useApiQuery } from '../../hooks/useApiQuery.jsx';
import { getAllIngredients } from '../../api/ingredientApi.jsx';
import Modal from '../../components/common/Modal/index.jsx';
import Button from '../../components/common/Button/index.jsx';
import SearchableSelect from '../../components/common/SearchableSelect/index.jsx';
import { PRODUCT_CATEGORIES, PRODUCT_STATUS } from '../../utils/constants.jsx';
import './ProductFormModal.css';

/**
 * ProductFormModal Component
 * Form for creating/editing products with variants and ingredient mappings
 * Entity: Product (name, category, price, status)
 * Entity: Variant (size, temperature, price, sku)
 * Entity: ProductIngredient (productId, ingredientId, quantityRequired)
 */
const ProductFormModal = ({ isOpen, onClose, onSubmit, product }) => {
  const { data: ingredientsData } = useApiQuery(getAllIngredients, { size: 1000 }, []);
  // Extract ingredients array from paginated response
  const ingredients = ingredientsData?.content || ingredientsData || [];
  
  const [formData, setFormData] = useState({
    name: '',
    category: PRODUCT_CATEGORIES[0],
    price: '',
    status: PRODUCT_STATUS.AVAILABLE,
    description: '',
    imageUrl: ''
  });
  
  const [variants, setVariants] = useState([]);
  const [productIngredients, setProductIngredients] = useState([]);
  const [errors, setErrors] = useState({});
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.categoryName || product.category || PRODUCT_CATEGORIES[0],
        price: product.price?.toString() || '',
        status: product.status || PRODUCT_STATUS.AVAILABLE,
        description: product.description || '',
        imageUrl: product.imageUrl || ''
      });
      // Backend returns 'ingredients', not 'productIngredients'
      const ings = product.ingredients || product.productIngredients || [];
      setProductIngredients(ings.map(i => ({
        ingredientId: i.ingredientId || '',
        quantityRequired: i.quantity || i.quantityRequired || '',
        unit: i.unit || 'g'
      })));
      setVariants(product.variants || []);
    } else {
      setFormData({
        name: '',
        category: PRODUCT_CATEGORIES[0],
        price: '',
        status: PRODUCT_STATUS.AVAILABLE,
        description: '',
        imageUrl: ''
      });
      setProductIngredients([]);
      // Default variant if creating new
      setVariants([
        { id: Date.now(), size: 'Regular', temperature: 'None', price: '', sku: '' }
      ]);
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

  // Variant Management
  const addVariant = () => {
    setVariants([...variants, {
      id: Date.now(),
      size: '',
      temperature: 'None',
      price: '',
      sku: ''
    }]);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  // Ingredient Management
  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  const addIngredient = () => {
    setProductIngredients([...productIngredients, {
      ingredientId: ingredients[0]?.id || '',
      quantityRequired: '',
      unit: ingredients[0]?.unit || 'g'
    }]);
  };

  const updateIngredient = (index, updates) => {
    const updated = [...productIngredients];
    updated[index] = { ...updated[index], ...updates };
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
      newErrors.price = 'Valid base price is required';
    }
    
    // Validate variants
    if (variants.length === 0) {
      newErrors.variants = 'At least one variant is required';
    } else {
      const invalidVariant = variants.some(v => !v.size);
      if (invalidVariant) {
        newErrors.variants = 'All variants must have a size';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const basePrice = parseFloat(formData.price);
    const submitData = {
      ...formData,
      price: basePrice,
      imageUrl: formData.imageUrl || null,
      variants: variants.map(v => ({
        ...v,
        price: (v.price && parseFloat(v.price) > 0) ? parseFloat(v.price) : basePrice,
        id: typeof v.id === 'string' ? v.id : undefined 
      })),
      ingredients: productIngredients.map(pi => ({
        ingredientId: parseInt(pi.ingredientId),
        quantity: parseFloat(pi.quantityRequired),
        unit: pi.unit || 'g'
      })).filter(pi => pi.ingredientId && pi.quantity > 0)
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
        {/* General Info */}
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
                placeholder="e.g. Cappuccino"
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
              <label htmlFor="price">Base Price (VND) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="1000"
                className={errors.price ? 'error' : ''}
                placeholder="0"
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

            <div className="form-group form-group--full">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                placeholder="Product description..."
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="imageUrl">Image URL</label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="form-section">
          <div className="section-header">
            <h3>Product Variants</h3>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={addVariant}
            >
              + Add Variant
            </Button>
          </div>
          
          {errors.variants && <div className="error-message">{errors.variants}</div>}
          
          <div className="variants-table-container">
            <table className="variants-table">
              <thead>
                <tr>
                  <th>Size *</th>
                  <th>Temperature</th>
                  <th>Price</th>
                  <th>SKU</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr key={variant.id || index}>
                    <td>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        placeholder="e.g. Small"
                        className="variant-input"
                      />
                    </td>
                    <td>
                      <select
                        value={variant.temperature}
                        onChange={(e) => updateVariant(index, 'temperature', e.target.value)}
                        className="variant-input"
                      >
                        <option value="None">None</option>
                        <option value="Hot">Hot</option>
                        <option value="Cold">Cold</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        placeholder="0"
                        className="variant-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        placeholder="Optional"
                        className="variant-input"
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeVariant(index)}
                        disabled={variants.length <= 1}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ingredients Section */}
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

          <div className="ingredient-search">
            <input
              type="text"
              placeholder="🔍 Search ingredients..."
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
              className="search-input"
            />
            {ingredientSearch && (
              <span className="search-results">
                {filteredIngredients.length} found
              </span>
            )}
          </div>

          {productIngredients.length === 0 ? (
            <p className="empty-message">No ingredients added yet</p>
          ) : (
            <div className="ingredients-list">
              {productIngredients.map((pi, index) => (
                <div key={index} className="ingredient-row">
                  <SearchableSelect
                    value={pi.ingredientId}
                    onChange={(e) => {
                      const ingId = e.target.value;
                      const ing = ingredients.find(i => i.id === parseInt(ingId));
                      const updates = { ingredientId: ingId };
                      if (ing) updates.unit = ing.unit;
                      updateIngredient(index, updates);
                    }}
                    options={ingredients?.map(ing => ({ value: ing.id, label: `${ing.name} (${ing.unit})` })) || []}
                    placeholder="Select Ingredient"
                    className="ingredient-select"
                    clearValue=""
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={pi.quantityRequired}
                    onChange={(e) => updateIngredient(index, { quantityRequired: e.target.value })}
                    min="0"
                    step="0.01"
                    className="quantity-input"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={pi.unit}
                    onChange={(e) => updateIngredient(index, { unit: e.target.value })}
                    className="unit-input-small"
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
