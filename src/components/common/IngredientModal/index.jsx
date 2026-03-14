import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useApiQuery } from '../../../hooks/useApiQuery.jsx';
import { getAllSuppliers } from '../../../api/supplierApi.jsx';
import Modal from '../Modal/index.jsx';
import Button from '../Button/index.jsx';
import { INGREDIENT_UNITS } from '../../../utils/constants.jsx';
import './IngredientModal.css';

/**
 * IngredientModal Component
 * Modal for creating/editing ingredients
 * Backend DTO: { name, unit, currentStock, minStock, unitCost, supplierId }
 */
const IngredientModal = ({ isOpen, onClose, onSubmit, ingredient }) => {
  const { data: suppliersData } = useApiQuery(getAllSuppliers, {}, []);
  const suppliers = Array.isArray(suppliersData) ? suppliersData : suppliersData?.content || [];

  const [formData, setFormData] = useState({
    name: '',
    unit: INGREDIENT_UNITS[0],
    currentStock: '',
    unitCost: '',
    minStock: '',
    supplierId: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || '',
        unit: ingredient.unit || INGREDIENT_UNITS[0],
        currentStock: ingredient.currentStock?.toString() || ingredient.quantity?.toString() || '',
        unitCost: ingredient.unitCost?.toString() || ingredient.pricePerUnit?.toString() || '',
        minStock: ingredient.minStock?.toString() || ingredient.minimumStock?.toString() || '',
        supplierId: (ingredient.supplierId || ingredient.supplier?.id)?.toString() || ''
      });
    } else {
      setFormData({
        name: '',
        unit: INGREDIENT_UNITS[0],
        currentStock: '',
        unitCost: '',
        minStock: '',
        supplierId: ''
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
    if (!formData.currentStock || parseFloat(formData.currentStock) < 0) {
      newErrors.currentStock = 'Valid current stock is required (≥ 0)';
    }
    if (!formData.unitCost || parseFloat(formData.unitCost) <= 0) {
      newErrors.unitCost = 'Valid unit cost is required';
    }
    if (!formData.minStock || parseFloat(formData.minStock) < 0) {
      newErrors.minStock = 'Valid min stock is required (≥ 0)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      name: formData.name,
      unit: formData.unit,
      currentStock: parseFloat(formData.currentStock),
      unitCost: parseFloat(formData.unitCost),
      minStock: parseFloat(formData.minStock),
      ...(formData.supplierId ? { supplierId: parseInt(formData.supplierId) } : {})
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
            <label htmlFor="currentStock">Current Stock *</label>
            <input
              type="number"
              id="currentStock"
              name="currentStock"
              value={formData.currentStock}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={errors.currentStock ? 'error' : ''}
              placeholder="0.00"
            />
            {errors.currentStock && <span className="error-message">{errors.currentStock}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="unitCost">Unit Cost (VND) *</label>
            <input
              type="number"
              id="unitCost"
              name="unitCost"
              value={formData.unitCost}
              onChange={handleChange}
              min="0"
              step="1000"
              className={errors.unitCost ? 'error' : ''}
              placeholder="Cost per unit"
            />
            {errors.unitCost && <span className="error-message">{errors.unitCost}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="minStock">Min Stock (Reorder Level) *</label>
            <input
              type="number"
              id="minStock"
              name="minStock"
              value={formData.minStock}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={errors.minStock ? 'error' : ''}
              placeholder="Minimum before reorder"
            />
            {errors.minStock && <span className="error-message">{errors.minStock}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="supplierId">Supplier</label>
          <select
            id="supplierId"
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
          >
            <option value="">-- Select Supplier (optional) --</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
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
