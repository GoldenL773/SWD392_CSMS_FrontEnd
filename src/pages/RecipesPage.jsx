import React from 'react';
import { RecipeManager } from '../features/menu/index.js';
import './RecipesPage.css';

/**
 * RecipesPage Component
 * Page for managing recipes (Manager only)
 */
const RecipesPage = () => {
  // Mock data - replace with actual API calls
  const recipes = [];
  const ingredients = [];
  const products = [];

  const handleCreateRecipe = (recipeData) => {
    console.log('Create recipe:', recipeData);
    // TODO: Implement API call
  };

  const handleUpdateRecipe = (recipeId, recipeData) => {
    console.log('Update recipe:', recipeId, recipeData);
    // TODO: Implement API call
  };

  const handleDeleteRecipe = (recipeId) => {
    console.log('Delete recipe:', recipeId);
    // TODO: Implement API call
  };

  return (
    <div className="recipes-page">
      <RecipeManager
        recipes={recipes}
        ingredients={ingredients}
        products={products}
        onCreateRecipe={handleCreateRecipe}
        onUpdateRecipe={handleUpdateRecipe}
        onDeleteRecipe={handleDeleteRecipe}
      />
    </div>
  );
};

export default RecipesPage;
