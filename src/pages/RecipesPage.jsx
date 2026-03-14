import React from 'react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { RecipeManager } from '../features/menu/index.js';
import ToastContainer from '../components/common/Toast/ToastContainer.jsx';
import { getAllIngredients } from '../api/ingredientApi.jsx';
import { getAllProducts } from '../api/productApi.jsx';
import { getAllRecipes, createRecipe, updateRecipe, deleteRecipe } from '../api/recipeApi.jsx';
import './RecipesPage.css';

/**
 * RecipesPage Component
 * Page for managing recipes (Manager only)
 */
const RecipesPage = () => {
  const toast = useToast();

  const { data: recipesData, loading: recipesLoading, refetch: refetchRecipes } = useApiQuery(getAllRecipes, {}, []);
  const { data: ingredientsData } = useApiQuery(getAllIngredients, { size: 1000 }, []);
  const { data: productsData } = useApiQuery(getAllProducts, { size: 1000 }, []);

  const recipes = recipesData?.content || recipesData || [];
  const ingredients = ingredientsData?.content || ingredientsData || [];
  const products = productsData?.content || productsData || [];

  const handleCreateRecipe = async (recipeData) => {
    try {
      await createRecipe(recipeData);
      toast.success('Recipe created successfully!');
      refetchRecipes();
    } catch (err) {
      toast.error('Failed to create recipe: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUpdateRecipe = async (recipeId, recipeData) => {
    try {
      await updateRecipe(recipeId, recipeData);
      toast.success('Recipe updated successfully!');
      refetchRecipes();
    } catch (err) {
      toast.error('Failed to update recipe: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await deleteRecipe(recipeId);
      toast.success('Recipe deleted successfully!');
      refetchRecipes();
    } catch (err) {
      toast.error('Failed to delete recipe: ' + (err.message || 'Unknown error'));
    }
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
        loading={recipesLoading}
      />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};

export default RecipesPage;
