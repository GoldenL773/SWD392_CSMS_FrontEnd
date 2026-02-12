import apiClient from './apiClient';

const BASE_URL = '/recipes';

export const getAllRecipes = async (params) => {
  const response = await apiClient.get(BASE_URL, { params });
  return response.data;
};

export const getRecipeById = async (id) => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const getRecipeByProductId = async (productId) => {
  const response = await apiClient.get(`${BASE_URL}/product/${productId}`);
  return response.data;
};

export const createRecipe = async (data) => {
  const response = await apiClient.post(BASE_URL, data);
  return response.data;
};

export const updateRecipe = async (id, data) => {
  const response = await apiClient.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteRecipe = async (id) => {
  const response = await apiClient.delete(`${BASE_URL}/${id}`);
  return response.data;
};
