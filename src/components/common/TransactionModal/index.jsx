import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useApiQuery } from '../../../hooks/useApiQuery.jsx';
import { getAllIngredients } from '../../../api/ingredientApi.jsx';
import Modal from '../Modal/index.jsx';
import Button from '../Button/index.jsx';
import { TRANSACTION_TYPE } from '../../../utils/constants.jsx';
import './TransactionModal.css';

/**
 * TransactionModal Component
 * Modal for recording ingredient transactions (Import/Export)
 * Entity: IngredientTransaction (ingredient, type, quantity, transactionDate)
 */
const TransactionModal = ({ isOpen, onClose, onSubmit }) => {
  const { data: ingredientsData } = useApiQuery(getAllIngredients, {}, []);
  // Extract ingredients array from paginated response
  const ingredients = ingredientsData?.content || ingredientsData || [];
  const [formData, setFormData] = useState({
    ingredientId: '',
    type: TRANSACTION_TYPE.IMPORT,
    quantity: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && ingredients.length > 0) {
      setFormData(prev => ({
        ...prev,
        ingredientId: prev.ingredientId || ingredients[0].id.toString()
      }));
    }
  }, [isOpen, ingredients]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.ingredientId) {
      newErrors.ingredientId = 'Please select an ingredient';
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      ingredientId: parseInt(formData.ingredientId),
      type: formData.type,
      quantity: parseFloat(formData.quantity),
      transactionDate: formData.transactionDate
    };

    onSubmit(submitData);
    
    // Reset form
    setFormData({
      ingredientId: ingredients[0]?.id.toString() || '',
      type: TRANSACTION_TYPE.IMPORT,
      quantity: '',
      transactionDate: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  const selectedIngredient = ingredients?.find(
    ing => ing.id.toString() === formData.ingredientId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Transaction"
    >
      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="ingredientId">Ingredient *</label>
          <select
            id="ingredientId"
            name="ingredientId"
            value={formData.ingredientId}
            onChange={handleChange}
            className={errors.ingredientId ? 'error' : ''}
          >
            {!ingredients || ingredients.length === 0 ? (
              <option value="">No ingredients available</option>
            ) : (
              ingredients.map(ing => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.unit})
                </option>
              ))
            )}
          </select>
          {errors.ingredientId && <span className="error-message">{errors.ingredientId}</span>}
        </div>

        {selectedIngredient && (
          <div className="ingredient-info">
            <span className="info-label">Current Stock:</span>
            <span className="info-value">
              {selectedIngredient.quantity} {selectedIngredient.unit}
            </span>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Transaction Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value={TRANSACTION_TYPE.IMPORT}>Import (Add Stock)</option>
              <option value={TRANSACTION_TYPE.EXPORT}>Export (Remove Stock)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
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
          <label htmlFor="transactionDate">Transaction Date *</label>
          <input
            type="date"
            id="transactionDate"
            name="transactionDate"
            value={formData.transactionDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Record Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
};

TransactionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default TransactionModal;
