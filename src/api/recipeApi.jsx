import apiClient from './apiClient';

const BASE_URL = '/recipes';

export const getAllRecipes = async (params) => {
  return apiClient.get(BASE_URL, params);
};

export const getRecipeById = async (id) => {
  return apiClient.get(`${BASE_URL}/${id}`);
};

export const getRecipeByProductId = async (productId) => {
  return apiClient.get(`${BASE_URL}/product/${productId}`);
};

export const createRecipe = async (data) => {
  return apiClient.post(BASE_URL, data);
};

export const updateRecipe = async (id, data) => {
  return apiClient.put(`${BASE_URL}/${id}`, data);
};

export const deleteRecipe = async (id) => {
  return apiClient.delete(`${BASE_URL}/${id}`);
};
