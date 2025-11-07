import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useApiQuery } from '../../../hooks/useApiQuery.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { getAllIngredients } from '../../../api/ingredientApi.jsx';
import Modal from '../Modal/index.jsx';
import Button from '../Button/index.jsx';
import { TRANSACTION_TYPE } from '../../../utils/constants.jsx';
import './TransactionModal.css';

/**
 * TransactionModal Component
 * Modal for recording ingredient transactions (Import/Export) with multiple ingredients
 * Entity: IngredientTransaction (ingredient, type, quantity, transactionDate)
 */
const TransactionModal = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const { data: ingredientsData } = useApiQuery(getAllIngredients, { size: 1000 }, []);
  // Extract ingredients array from paginated response
  const ingredients = ingredientsData?.content || ingredientsData || [];
  
  const [transactionType, setTransactionType] = useState(TRANSACTION_TYPE.IMPORT);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [ingredientItems, setIngredientItems] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && ingredients.length > 0) {
      // Initialize with one empty item
      setIngredientItems([{
        id: Date.now(),
        ingredientId: ingredients[0].id.toString(),
        quantity: ''
      }]);
      setTransactionType(TRANSACTION_TYPE.IMPORT);
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setErrors({});
    }
  }, [isOpen, ingredients]);

  const handleAddIngredient = () => {
    setIngredientItems(prev => [
      ...prev,
      {
        id: Date.now(),
        ingredientId: ingredients[0]?.id.toString() || '',
        quantity: ''
      }
    ]);
  };

  const handleRemoveIngredient = (id) => {
    if (ingredientItems.length > 1) {
      setIngredientItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    setIngredientItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
    if (errors[`${field}_${id}`]) {
      setErrors(prev => ({ ...prev, [`${field}_${id}`]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (ingredientItems.length === 0) {
      newErrors.general = 'Please add at least one ingredient';
    }
    
    ingredientItems.forEach(item => {
      if (!item.ingredientId) {
        newErrors[`ingredientId_${item.id}`] = 'Required';
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        newErrors[`quantity_${item.id}`] = 'Required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Submit array of transactions with employeeId
    const transactions = ingredientItems.map(item => ({
      ingredientId: parseInt(item.ingredientId),
      employeeId: user?.id || 1, // Include logged-in user's ID
      type: transactionType,
      quantity: parseFloat(item.quantity),
      transactionDate: transactionDate
    }));

    console.log('Submitting transactions with employee:', transactions);
    onSubmit(transactions);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Transaction"
    >
      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Transaction Type *</label>
            <select
              id="type"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value={TRANSACTION_TYPE.IMPORT}>Import (Add Stock)</option>
              <option value={TRANSACTION_TYPE.EXPORT}>Export (Remove Stock)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="transactionDate">Transaction Date *</label>
            <input
              type="date"
              id="transactionDate"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>
        </div>

        <div className="ingredients-section">
          <div className="section-header">
            <label>Ingredients *</label>
            <Button type="button" variant="secondary" size="small" onClick={handleAddIngredient}>
              + Add Ingredient
            </Button>
          </div>
          
          {errors.general && <span className="error-message">{errors.general}</span>}
          
          <div className="ingredient-items">
            {ingredientItems.map((item, index) => {
              const selectedIngredient = ingredients?.find(
                ing => ing.id.toString() === item.ingredientId
              );
              
              return (
                <div key={item.id} className="ingredient-item">
                  <div className="item-number">{index + 1}</div>
                  <div className="item-fields">
                    <div className="form-group">
                      <select
                        value={item.ingredientId}
                        onChange={(e) => handleItemChange(item.id, 'ingredientId', e.target.value)}
                        className={errors[`ingredientId_${item.id}`] ? 'error' : ''}
                      >
                        {ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit})
                          </option>
                        ))}
                      </select>
                      {selectedIngredient && (
                        <span className="current-stock">
                          Stock: {selectedIngredient.quantity} {selectedIngredient.unit}
                        </span>
                      )}
                    </div>
                    
                    <div className="form-group quantity-group">
                      <label className="quantity-label">
                        Quantity ({selectedIngredient?.unit || 'unit'})
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder={`Enter ${transactionType.toLowerCase()} quantity`}
                        className={errors[`quantity_${item.id}`] ? 'error' : ''}
                      />
                      {selectedIngredient && (
                        <span className="price-hint">
                          Price: {selectedIngredient.pricePerUnit?.toLocaleString()} đ/{selectedIngredient.unit}
                        </span>
                      )}
                    </div>
                    
                    {ingredientItems.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleRemoveIngredient(item.id)}
                        title="Remove ingredient"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
