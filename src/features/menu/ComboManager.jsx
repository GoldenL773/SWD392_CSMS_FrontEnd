import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Package, Plus, Pencil, Trash, X, Check } from '@phosphor-icons/react';
import './ComboManager.css';

/**
 * ComboManager Component
 * Manages combo offerings within the menu section
 * Allows creating, editing, and deleting combos with multiple products
 * Supports read-only mode for Staff
 */
const ComboManager = ({ 
  combos = [], 
  products = [], 
  onCreateCombo, 
  onEditCombo, 
  onDeleteCombo,
  isReadOnly = false
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    products: []
  });

  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      products: []
    });
    setErrors({});
    setEditingCombo(null);
    setIsFormOpen(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (combo) => {
    setEditingCombo(combo);
    setFormData({
      name: combo.name,
      description: combo.description,
      price: combo.price.toString(),
      imageUrl: combo.imageUrl || '',
      products: combo.products || []
    });
    setIsFormOpen(true);
  };

  const handleAddProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { productId: '', variantId: '', quantity: 1 }]
    }));
  };

  const handleRemoveProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleProductChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Combo name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (formData.products.length === 0) {
      newErrors.products = 'At least one product is required';
    }

    formData.products.forEach((product, index) => {
      if (!product.productId) {
        newErrors[`product_${index}`] = 'Product is required';
      }
      if (product.quantity <= 0) {
        newErrors[`quantity_${index}`] = 'Quantity must be positive';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const comboData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl,
      products: formData.products,
      available: true
    };

    if (editingCombo) {
      onEditCombo(editingCombo.id, comboData);
    } else {
      onCreateCombo(comboData);
    }

    resetForm();
  };

  const handleDelete = (comboId) => {
    onDeleteCombo(comboId);
    setDeleteConfirmId(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const filteredCombos = combos.filter(combo =>
    combo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="combo-manager">
      <div className="combo-manager-header">
        <div className="header-content">
          <Package size={32} weight="thin" />
          <div>
            <h2>{isReadOnly ? 'Combo Menu' : 'Combo Management'}</h2>
            <p>{isReadOnly ? 'Browse our value combos' : 'Create and manage combo offerings'}</p>
          </div>
        </div>
        {!isReadOnly && (
          <button className="btn-primary" onClick={handleOpenCreate}>
            <Plus size={20} weight="bold" />
            Create Combo
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="combo-search">
        <input
          type="text"
          placeholder="Search combos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Combo List */}
      <div className="combo-list">
        {filteredCombos.length === 0 ? (
          <div className="empty-state">
            <Package size={64} weight="thin" />
            <p>No combos found</p>
            {!isReadOnly && (
              <button className="btn-secondary" onClick={handleOpenCreate}>
                Create your first combo
              </button>
            )}
          </div>
        ) : (
          <div className="combo-grid">
            {filteredCombos.map(combo => (
              <div key={combo.id} className="combo-card">
                <div className="combo-image">
                  {combo.imageUrl ? (
                    <img src={combo.imageUrl} alt={combo.name} />
                  ) : (
                    <div className="image-placeholder">
                      <Package size={48} weight="thin" />
                    </div>
                  )}
                </div>
                <div className="combo-info">
                  <h3>{combo.name}</h3>
                  <p className="combo-description">{combo.description}</p>
                  <div className="combo-products">
                    <span className="products-label">Includes:</span>
                    <ul>
                      {combo.products?.map((p, idx) => (
                        <li key={idx}>
                          {p.quantity}x {getProductName(p.productId)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="combo-price">{formatPrice(combo.price)}</p>
                </div>
                {!isReadOnly && (
                  <div className="combo-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => handleOpenEdit(combo)}
                      title="Edit combo"
                    >
                      <Pencil size={20} weight="thin" />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      onClick={() => setDeleteConfirmId(combo.id)}
                      title="Delete combo"
                    >
                      <Trash size={20} weight="thin" />
                    </button>
                  </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirmId === combo.id && !isReadOnly && (
                  <div className="delete-confirm">
                    <p>Delete this combo?</p>
                    <div className="confirm-actions">
                      <button 
                        className="btn-confirm" 
                        onClick={() => handleDelete(combo.id)}
                      >
                        <Check size={16} weight="bold" />
                        Yes
                      </button>
                      <button 
                        className="btn-cancel" 
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        <X size={16} weight="bold" />
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Combo Form Modal - Only render if not read-only and form is open */}
      {!isReadOnly && isFormOpen && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCombo ? 'Edit Combo' : 'Create New Combo'}</h3>
              <button className="btn-close" onClick={resetForm}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="combo-form">
              {/* General Information */}
              <div className="form-section">
                <h4>General Information</h4>
                
                <div className="form-group">
                  <label htmlFor="combo-name">
                    Combo Name <span className="required">*</span>
                  </label>
                  <input
                    id="combo-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? 'error' : ''}
                    placeholder="e.g., Morning Breakfast Combo"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="combo-description">Description</label>
                  <textarea
                    id="combo-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the combo..."
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="combo-price">
                      Price (VND) <span className="required">*</span>
                    </label>
                    <input
                      id="combo-price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={errors.price ? 'error' : ''}
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                    {errors.price && <span className="error-message">{errors.price}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="combo-image">Image URL</label>
                    <input
                      id="combo-image"
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="form-section">
                <div className="section-header">
                  <h4>Products <span className="required">*</span></h4>
                  <button 
                    type="button" 
                    className="btn-secondary btn-sm"
                    onClick={handleAddProduct}
                  >
                    <Plus size={16} weight="bold" />
                    Add Product
                  </button>
                </div>

                {errors.products && (
                  <span className="error-message">{errors.products}</span>
                )}

                <div className="products-table">
                  {formData.products.length === 0 ? (
                    <div className="empty-products">
                      <p>No products added yet</p>
                    </div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.products.map((product, index) => (
                          <tr key={index}>
                            <td>
                              <select
                                value={product.productId}
                                onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                                className={errors[`product_${index}`] ? 'error' : ''}
                              >
                                <option value="">Select product...</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                              {errors[`product_${index}`] && (
                                <span className="error-message">{errors[`product_${index}`]}</span>
                              )}
                            </td>
                            <td>
                              <input
                                type="number"
                                value={product.quantity}
                                onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                className={errors[`quantity_${index}`] ? 'error' : ''}
                                min="1"
                              />
                              {errors[`quantity_${index}`] && (
                                <span className="error-message">{errors[`quantity_${index}`]}</span>
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn-icon btn-danger"
                                onClick={() => handleRemoveProduct(index)}
                                title="Remove product"
                              >
                                <Trash size={18} weight="thin" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCombo ? 'Update Combo' : 'Create Combo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

ComboManager.propTypes = {
  combos: PropTypes.array,
  products: PropTypes.array,
  onCreateCombo: PropTypes.func,
  onEditCombo: PropTypes.func,
  onDeleteCombo: PropTypes.func,
  isReadOnly: PropTypes.bool
};

export default ComboManager;
