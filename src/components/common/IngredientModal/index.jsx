import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal/index.jsx';
import Button from '../Button/index.jsx';
import { INGREDIENT_UNITS } from '../../../utils/constants.jsx';
import './IngredientModal.css';

/**
 * IngredientModal Component
 * Modal for creating/editing ingredients
 * Entity: Ingredient (name, unit, quantity, reorderLevel, supplier)
 */
const IngredientModal = ({ isOpen, onClose, onSubmit, ingredient }) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: INGREDIENT_UNITS[0],
    quantity: '',
    pricePerUnit: '',
    reorderLevel: '',
    supplier: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || '',
        unit: ingredient.unit || INGREDIENT_UNITS[0],
        quantity: ingredient.quantity?.toString() || '',
        pricePerUnit: ingredient.pricePerUnit?.toString() || '',
        reorderLevel: ingredient.minimumStock?.toString() || '',
        supplier: ingredient.supplier || ''
      });
    } else {
      setFormData({
        name: '',
        unit: INGREDIENT_UNITS[0],
        quantity: '',
        pricePerUnit: '',
        reorderLevel: '',
        supplier: ''
      });
    }
    setErrors({});
  }, [ingredient, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Ingredient name is required';
    }
    if (!formData.quantity || parseFloat(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = 'Valid price per unit is required';
    }
    if (!formData.reorderLevel || parseFloat(formData.reorderLevel) < 0) {
      newErrors.reorderLevel = 'Valid reorder level is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Backend expects 'minimumStock' instead of 'reorderLevel'
    const submitData = {
      name: formData.name,
      unit: formData.unit,
      quantity: parseFloat(formData.quantity),
      pricePerUnit: parseFloat(formData.pricePerUnit),
      minimumStock: parseFloat(formData.reorderLevel),
      supplier: formData.supplier
    };

    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ingredient ? 'Edit Ingredient' : 'Add New Ingredient'}
    >
      <form className="ingredient-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Ingredient Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="e.g., Coffee Beans, Milk, Sugar"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="unit">Unit *</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
            >
              {INGREDIENT_UNITS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Current Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={errors.quantity ? 'error' : ''}
              placeholder="0.00"
            />
            {errors.quantity && <span className="error-message">{errors.quantity}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="pricePerUnit">Price Per Unit (VND) *</label>
          <input
            type="number"
            id="pricePerUnit"
            name="pricePerUnit"
            value={formData.pricePerUnit}
            onChange={handleChange}
            min="0"
            step="1000"
            className={errors.pricePerUnit ? 'error' : ''}
            placeholder="Price per unit"
          />
          {errors.pricePerUnit && <span className="error-message">{errors.pricePerUnit}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="reorderLevel">Reorder Level *</label>
          <input
            type="number"
            id="reorderLevel"
            name="reorderLevel"
            value={formData.reorderLevel}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={errors.reorderLevel ? 'error' : ''}
            placeholder="Minimum quantity before reorder"
          />
          {errors.reorderLevel && <span className="error-message">{errors.reorderLevel}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="supplier">Supplier</label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="Supplier name (optional)"
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {ingredient ? 'Update Ingredient' : 'Add Ingredient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

IngredientModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  ingredient: PropTypes.object
};

export default IngredientModal;
