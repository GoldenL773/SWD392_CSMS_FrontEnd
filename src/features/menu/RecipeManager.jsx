import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/common/Button/index.jsx';
import Modal from '../../components/common/Modal/index.jsx';
import { 
  Plus, 
  MagnifyingGlass, 
  PencilSimple, 
  Trash,
  Clock,
  CookingPot
} from '@phosphor-icons/react';
import { generateId } from '../../utils/formatters.jsx';
import { getProductIngredients } from '../../api/ingredientApi.jsx';
import SearchableSelect from '../../components/common/SearchableSelect/index.jsx';
import './RecipeManager.css';

/**
 * RecipeManager Component
 * Dedicated section for managers to create and edit recipes
 * 
 * Features:
 * - List all recipes with search/filter
 * - Create new recipe form
 * - Edit existing recipes
 * - Delete recipes with confirmation
 * - Ingredient selector with quantity input
 * - Instructions text editor
 * - Prep time input
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
const RecipeManager = ({ 
  recipes = [], 
  ingredients = [], 
  products = [],
  onCreateRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
  loading = false,
  viewOnlyIngredients = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  // Filter recipes based on search and category
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || recipe.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from products - Fixed list per user requirement
  const categories = ['All', 'Coffee', 'Tea', 'Cake', 'Pastry', 'Sandwich', 'Beverage', 'Other'];

  const handleCreateClick = () => {
    setEditingRecipe(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (recipe) => {
    setEditingRecipe(recipe);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (recipeToDelete && onDeleteRecipe) {
      onDeleteRecipe(recipeToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setRecipeToDelete(null);
  };

  const handleFormSubmit = (recipeData) => {
    if (editingRecipe) {
      onUpdateRecipe(editingRecipe.id, recipeData);
    } else {
      onCreateRecipe(recipeData);
    }
    setIsFormOpen(false);
    setEditingRecipe(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingRecipe(null);
  };

  return (
    <div className="recipe-manager">
      {/* Header Section */}
      <div className="page-header">
        <div className="page-header-content">
          <CookingPot size={32} weight="thin" className="page-header-icon" />
          <div>
            <h2 className="page-title">Recipe Management</h2>
            <p className="page-subtitle">Manage recipes for all products</p>
          </div>
        </div>
        <div className="page-header-actions">
          {!viewOnlyIngredients && (
            <Button 
              variant="primary" 
              onClick={handleCreateClick}
              disabled={loading}
            >
              <Plus size={20} weight="regular" />
              Create Recipe
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="recipe-manager-controls">
        <div className="search-box">
          <MagnifyingGlass size={20} weight="regular" />
          <input
            type="text"
            placeholder="Search recipes by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Recipe List */}
      <div className="recipe-list">
        {filteredRecipes.length === 0 ? (
          <div className="empty-state">
            <p>No recipes found</p>
            {searchTerm && (
              <p className="empty-state-hint">Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          <div className="recipe-cards">
              {filteredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onEdit={() => handleEditClick(recipe)}
                  onDelete={() => handleDeleteClick(recipe)}
                  viewOnly={viewOnlyIngredients}
                />
              ))}
          </div>
        )}
      </div>

      {/* Recipe Form Modal */}
      {isFormOpen && (
        <RecipeFormModal
          isOpen={isFormOpen}
          onClose={handleFormCancel}
          onSubmit={handleFormSubmit}
          recipe={editingRecipe}
          ingredients={ingredients}
          products={products}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Recipe"
        size="small"
      >
        <div className="delete-confirmation">
          <p>Are you sure you want to delete the recipe for <strong>{recipeToDelete?.productName}</strong>?</p>
          <p className="warning-text">This action cannot be undone.</p>
          <div className="modal-actions">
            <Button 
              variant="secondary" 
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteConfirm}
              loading={loading}
            >
              Delete Recipe
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/**
 * RecipeCard Component
 * Displays individual recipe in the list
 */
const RecipeCard = ({ recipe, onEdit, onDelete, viewOnly = false }) => {
  const ingredientCount = recipe.ingredients?.length || 0;
  const hasInstructions = recipe.instructions && recipe.instructions.trim().length > 0;

  return (
    <div className="recipe-card">
      <div className="recipe-card-header">
        <h3 className="recipe-card-title">{recipe.productName}</h3>
        {!viewOnly && (
          <div className="recipe-card-actions">
            <button
              className="btn-icon btn-edit"
              onClick={onEdit}
              title="Edit recipe"
            >
              <PencilSimple size={18} weight="regular" />
            </button>
            <button
              className="btn-icon btn-delete"
              onClick={onDelete}
              title="Delete recipe"
            >
              <Trash size={18} weight="regular" />
            </button>
          </div>
        )}
      </div>

      <div className="recipe-card-body">
        {recipe.prepTime && (
          <div className="recipe-card-meta">
            <Clock size={16} weight="regular" />
            <span>{recipe.prepTime} min</span>
          </div>
        )}

        <div className="recipe-card-info">
          <div className="info-item">
            <span className="info-label">Ingredients:</span>
            <span className="info-value">{ingredientCount}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Instructions:</span>
            <span className="info-value">{hasInstructions ? 'Yes' : 'No'}</span>
          </div>
        </div>

        {ingredientCount > 0 && (
          <div className="recipe-card-ingredients">
            <p className="ingredients-preview">
              {recipe.ingredients.slice(0, 3).map(ing => ing.ingredientName || ing.name).join(', ')}
              {ingredientCount > 3 && ` +${ingredientCount - 3} more`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    productName: PropTypes.string.isRequired,
    ingredients: PropTypes.array,
    instructions: PropTypes.string,
    prepTime: PropTypes.number
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

/**
 * RecipeFormModal Component
 * Modal form for creating/editing recipes
 */
const RecipeFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  recipe, 
  ingredients, 
  products,
  loading 
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    instructions: '',
    prepTime: ''
  });

  const [recipeIngredients, setRecipeIngredients] = useState([
    { id: generateId(), ingredientId: '', quantity: '', unit: '' }
  ]);

  const [errors, setErrors] = useState({});

  // Initialize form with recipe data if editing
  React.useEffect(() => {
    if (recipe) {
      setFormData({
        productId: recipe.productId || '',
        instructions: recipe.instructions || '',
        prepTime: recipe.prepTime || ''
      });

      if (recipe.ingredients && recipe.ingredients.length > 0) {
        setRecipeIngredients(recipe.ingredients.map(ing => ({
          id: ing.id || generateId(),
          ingredientId: ing.ingredientId || '',
          quantity: ing.quantity || ing.quantityRequired || '',
          unit: ing.unit || ''
        })));
      }
    } else {
      // Reset form for new recipe
      setFormData({
        productId: '',
        instructions: '',
        prepTime: ''
      });
      setRecipeIngredients([
        { id: generateId(), ingredientId: '', quantity: '', unit: '' }
      ]);
    }
    setErrors({});
  }, [recipe, isOpen]);

  // Fetch product ingredients when a new product is selected
  React.useEffect(() => {
    const fetchProductIngredients = async () => {
      if (formData.productId && !recipe) { // Only auto-populate for new recipes
        try {
          console.log(`Fetching product ingredients for productId: ${formData.productId}`);
          const productIngredients = await getProductIngredients(formData.productId);
          console.log(`Received product ingredients:`, productIngredients);
          if (productIngredients && productIngredients.length > 0) {
            setRecipeIngredients(productIngredients.map(ing => ({
              id: generateId(),
              ingredientId: ing.ingredientId || ing.ingredient?.id || '',
              quantity: ing.quantity || ing.quantityRequired || '',
              unit: ing.unit || ing.ingredient?.unit || ''
            })));
          } else {
            // Default to one empty row if no ingredients found
            setRecipeIngredients([
              { id: generateId(), ingredientId: '', quantity: '', unit: '' }
            ]);
          }
        } catch (error) {
          console.error("Failed to fetch product ingredients:", error);
          // Don't clear existing if it fails, or maybe show an error
        }
      }
    };

    fetchProductIngredients();
  }, [formData.productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipeIngredients];
    newIngredients[index][field] = value;
    setRecipeIngredients(newIngredients);
    
    if (errors.ingredients) {
      setErrors(prev => ({
        ...prev,
        ingredients: null
      }));
    }
  };

  const addIngredient = () => {
    setRecipeIngredients([
      ...recipeIngredients,
      { id: generateId(), ingredientId: '', quantity: '', unit: '' }
    ]);
  };

  const removeIngredient = (index) => {
    if (recipeIngredients.length > 1) {
      const newIngredients = recipeIngredients.filter((_, i) => i !== index);
      setRecipeIngredients(newIngredients);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }

    if (recipeIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    } else {
      const hasInvalidIngredient = recipeIngredients.some(ing => {
        return !ing.ingredientId || !ing.quantity || parseFloat(ing.quantity) <= 0 || !ing.unit;
      });
      
      if (hasInvalidIngredient) {
        newErrors.ingredients = 'All ingredients must have ingredient, quantity, and unit';
      }
    }

    if (formData.prepTime && (parseFloat(formData.prepTime) <= 0 || isNaN(formData.prepTime))) {
      newErrors.prepTime = 'Prep time must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const ingredientsData = recipeIngredients.map(ing => ({
      ingredientId: ing.ingredientId,
      quantity: parseFloat(ing.quantity),
      unit: ing.unit.trim()
    }));

    const submitData = {
      productId: formData.productId,
      ingredients: ingredientsData,
      instructions: formData.instructions.trim(),
      prepTime: formData.prepTime ? parseInt(formData.prepTime) : null
    };

    onSubmit(submitData);
  };

  const selectedProduct = products.find(p => p.id === formData.productId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recipe ? 'Edit Recipe' : 'Create New Recipe'}
      size="large"
    >
      <form className="recipe-form" onSubmit={handleSubmit}>
        {/* Product Selector */}
        <div className="form-group">
          <label htmlFor="productId">Product *</label>
          <select
            id="productId"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            className={errors.productId ? 'error' : ''}
            disabled={!!recipe}
          >
            <option value="">Select a product</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          {errors.productId && <span className="error-message">{errors.productId}</span>}
          {recipe && (
            <p className="form-hint">Product cannot be changed when editing</p>
          )}
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <h4 className="form-section-title">Ingredients *</h4>
            <Button 
              type="button" 
              variant="secondary" 
              size="small" 
              onClick={addIngredient}
            >
              Add Ingredient
            </Button>
          </div>

          <div className="ingredients-table-container">
            <table className="ingredients-table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipeIngredients.map((ing, index) => (
                  <tr key={ing.id}>
                    <td>
                      <SearchableSelect
                        value={ing.ingredientId}
                        onChange={(e) => handleIngredientChange(index, 'ingredientId', e.target.value)}
                        options={ingredients.map(ingredient => ({ value: ingredient.id, label: ingredient.name }))}
                        placeholder="Select ingredient"
                        className="ingredient-input"
                        clearLabel="Select ingredient"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={ing.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        placeholder="0.0"
                        step="0.1"
                        className="ingredient-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={ing.unit}
                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        placeholder="Unit"
                        className="ingredient-input"
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-icon btn-delete"
                        onClick={() => removeIngredient(index)}
                        disabled={recipeIngredients.length === 1}
                        title="Remove ingredient"
                      >
                        <Trash size={18} weight="regular" />
                      </button>
                    </td>
                  </tr>
                ))}
                {recipeIngredients.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', py: 2 }}>
                      No ingredients defined for this product.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions Editor */}
        <div className="form-group">
          <label htmlFor="instructions">Preparation Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Enter step-by-step preparation instructions..."
            rows="6"
            className="instructions-textarea"
          />
        </div>

        {/* Prep Time Input */}
        <div className="form-group">
          <label htmlFor="prepTime">Preparation Time (minutes)</label>
          <input
            type="number"
            id="prepTime"
            name="prepTime"
            value={formData.prepTime}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="1"
            className={errors.prepTime ? 'error' : ''}
          />
          {errors.prepTime && <span className="error-message">{errors.prepTime}</span>}
        </div>

        {/* Form Actions */}
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
            {recipe ? 'Update Recipe' : 'Create Recipe'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

RecipeFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  recipe: PropTypes.object,
  ingredients: PropTypes.array.isRequired,
  products: PropTypes.array.isRequired,
  loading: PropTypes.bool
};

RecipeManager.propTypes = {
  recipes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productName: PropTypes.string.isRequired,
    ingredients: PropTypes.array,
    instructions: PropTypes.string,
    prepTime: PropTypes.number,
    category: PropTypes.string
  })),
  ingredients: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired
  })),
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string
  })),
  onCreateRecipe: PropTypes.func.isRequired,
  onUpdateRecipe: PropTypes.func.isRequired,
  onDeleteRecipe: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default RecipeManager;
