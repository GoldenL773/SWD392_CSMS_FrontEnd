// CSMS Product API

import apiClient from './apiClient.jsx';

/**
 * Get all products with optional filters and pagination
 */
export const getAllProducts = async (params = {}) => {
  const response = await apiClient.get('/products', params);
  // Return full response to preserve pagination metadata
  return response;
};

/**
 * Get product by ID
 */
export const getProductById = async (id) => {
  return apiClient.get(`/products/${id}`);
};

/**
 * Create new product
 */
export const createProduct = async (productData) => {
  return apiClient.post('/products', productData);
};

/**
 * Update product
 */
export const updateProduct = async (id, productData) => {
  return apiClient.put(`/products/${id}`, productData);
};

/**
 * Delete product
 */
export const deleteProduct = async (id) => {
  return apiClient.delete(`/products/${id}`);
};
