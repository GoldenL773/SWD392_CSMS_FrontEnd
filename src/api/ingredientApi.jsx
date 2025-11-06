// CSMS Ingredient API

import apiClient from './apiClient.jsx';

/**
 * Get all ingredients with optional search and pagination
 */
export const getAllIngredients = async (params = {}) => {
  const response = await apiClient.get('/ingredients', params);
  // Return full response to preserve pagination metadata
  return response;
};

/**
 * Get ingredient by ID
 */
export const getIngredientById = async (id) => {
  return apiClient.get(`/ingredients/${id}`);
};

/**
 * Create new ingredient
 */
export const createIngredient = async (ingredientData) => {
  return apiClient.post('/ingredients', ingredientData);
};

/**
 * Update ingredient
 */
export const updateIngredient = async (id, ingredientData) => {
  return apiClient.put(`/ingredients/${id}`, ingredientData);
};

/**
 * Delete ingredient
 */
export const deleteIngredient = async (id) => {
  return apiClient.delete(`/ingredients/${id}`);
};

/**
 * Record ingredient transaction (import/export)
 */
export const recordTransaction = async (transactionData) => {
  return apiClient.post('/ingredients/transactions', transactionData);
};

/**
 * Get ingredient transactions
 */
export const getTransactions = async (params = {}) => {
  const response = await apiClient.get('/ingredients/transactions', params);
  return response.content || response;
};

/**
 * Get low stock ingredients
 */
export const getLowStockIngredients = async () => {
  return apiClient.get('/ingredients/low-stock');
};
