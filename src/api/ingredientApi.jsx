// CSMS Ingredient API

import apiClient from './apiClient.jsx';
import { mockIngredients } from '../utils/mockData.jsx';

/**
 * Get all ingredients
 */
export const getAllIngredients = async (params = {}) => {
  // TODO: Replace with actual API call
  // return apiClient.get('/ingredients', params);
  
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      let ingredients = [...mockIngredients];
      
      // Search by name
      if (params.search) {
        ingredients = ingredients.filter(i => 
          i.name.toLowerCase().includes(params.search.toLowerCase())
        );
      }
      
      resolve(ingredients);
    }, 300);
  });
};

/**
 * Get ingredient by ID
 */
export const getIngredientById = async (id) => {
  // TODO: Replace with actual API call
  // return apiClient.get(`/ingredients/${id}`);
  
  // Mock implementation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const ingredient = mockIngredients.find(i => i.id === parseInt(id));
      if (ingredient) {
        resolve(ingredient);
      } else {
        reject(new Error('Ingredient not found'));
      }
    }, 300);
  });
};

/**
 * Create new ingredient
 */
export const createIngredient = async (ingredientData) => {
  // TODO: Replace with actual API call
  // return apiClient.post('/ingredients', ingredientData);
  
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const newIngredient = {
        id: mockIngredients.length + 1,
        ...ingredientData
      };
      resolve(newIngredient);
    }, 500);
  });
};

/**
 * Update ingredient
 */
export const updateIngredient = async (id, ingredientData) => {
  // TODO: Replace with actual API call
  // return apiClient.put(`/ingredients/${id}`, ingredientData);
  
  // Mock implementation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const ingredient = mockIngredients.find(i => i.id === parseInt(id));
      if (ingredient) {
        const updatedIngredient = { ...ingredient, ...ingredientData };
        resolve(updatedIngredient);
      } else {
        reject(new Error('Ingredient not found'));
      }
    }, 500);
  });
};

/**
 * Delete ingredient
 */
export const deleteIngredient = async (id) => {
  // TODO: Replace with actual API call
  // return apiClient.delete(`/ingredients/${id}`);
  
  // Mock implementation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockIngredients.findIndex(i => i.id === parseInt(id));
      if (index !== -1) {
        resolve({ success: true, message: 'Ingredient deleted successfully' });
      } else {
        reject(new Error('Ingredient not found'));
      }
    }, 500);
  });
};
