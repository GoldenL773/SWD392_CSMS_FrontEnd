// CSMS Order API

import apiClient from './apiClient.jsx';

/**
 * Get all orders with optional filters and pagination
 */
export const getAllOrders = async (params = {}) => {
  const response = await apiClient.get('/orders', params);
  // Return full response to preserve pagination metadata
  return response;
};

/**
 * Get order by ID
 */
export const getOrderById = async (id) => {
  return apiClient.get(`/orders/${id}`);
};

/**
 * Create new order
 */
export const createOrder = async (orderData) => {
  return apiClient.post('/orders', orderData);
};

/**
 * Update order status
 */
export const updateOrderStatus = async (id, status) => {
  return apiClient.put(`/orders/${id}/status`, { status });
};

/**
 * Delete order
 */
export const deleteOrder = async (id) => {
  return apiClient.delete(`/orders/${id}`);
};
