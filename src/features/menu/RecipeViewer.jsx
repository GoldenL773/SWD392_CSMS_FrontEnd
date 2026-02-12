import React from 'react';
import PropTypes from 'prop-types';
import { ClockIcon } from '../../utils/icons.js';
import './RecipeViewer.css';

/**
 * RecipeViewer Component
 * Displays recipe information for baristas when viewing menu items
 * 
 * Features:
 * - Shows ingredients list with quantities
 * - Displays preparation instructions (if available)
 * - Supports both view and compact modes
 * - Formatted for easy reading during beverage preparation
 * 
 * @param {Object} recipe - Recipe data object
 * @param {string} mode - Display mode: 'view' (full) or 'compact' (ingredients only)
 */
const RecipeViewer = ({ recipe, mode = 'view' }) => {
  if (!recipe) {
    return (
      <div className="recipe-viewer">
        <div className="recipe-empty">
          <p>No recipe information available</p>
        </div>
      </div>
    );
  }

  const {
    productName,
    ingredients = [],
    instructions,
    prepTime
  } = recipe;

  const hasIngredients = ingredients && ingredients.length > 0;
  const hasInstructions = instructions && instructions.trim().length > 0;

  return (
    <div className={`recipe-viewer recipe-viewer--${mode}`}>
      {/* Recipe Header */}
      <div className="recipe-header">
        <h3 className="recipe-product-name">{productName}</h3>
        {prepTime && mode === 'view' && (
          <div className="recipe-prep-time">
            <ClockIcon size={16} weight="regular" />
            <span>{prepTime} min</span>
          </div>
        )}
      </div>

      {/* Ingredients Section */}
      {hasIngredients && (
        <div className="recipe-section">
          <h4 className="recipe-section-title">Ingredients</h4>
          <div className="recipe-ingredients-list">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="recipe-ingredient-item">
                <span className="ingredient-name">
                  {ingredient.ingredientName || ingredient.name}
                </span>
                <span className="ingredient-quantity">
                  {ingredient.quantity || ingredient.quantityRequired} {ingredient.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions Section - Only in view mode */}
      {mode === 'view' && hasInstructions && (
        <div className="recipe-section">
          <h4 className="recipe-section-title">Preparation Instructions</h4>
          <div className="recipe-instructions">
            <p>{instructions}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasIngredients && !hasInstructions && (
        <div className="recipe-empty">
          <p>No recipe details available for this product</p>
        </div>
      )}
    </div>
  );
};

RecipeViewer.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productName: PropTypes.string,
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        ingredientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        ingredientName: PropTypes.string,
        name: PropTypes.string,
        quantity: PropTypes.number,
        quantityRequired: PropTypes.number,
        unit: PropTypes.string
      })
    ),
    instructions: PropTypes.string,
    prepTime: PropTypes.number
  }),
  mode: PropTypes.oneOf(['view', 'compact'])
};

export default RecipeViewer;
