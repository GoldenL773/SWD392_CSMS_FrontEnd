import apiClient from './apiClient';

const BASE_URL = '/suppliers';

export const getAllSuppliers = async (params) => {
  const response = await apiClient.get(BASE_URL, params);
  // Support both paginated and direct array response structures
  return response.content || response || [];
};

export const getSupplierById = async (id) => {
  return apiClient.get(`${BASE_URL}/${id}`);
};

export const createSupplier = async (data) => {
  return apiClient.post(BASE_URL, data);
};

export const updateSupplier = async (id, data) => {
  return apiClient.put(`${BASE_URL}/${id}`, data);
};

export const deleteSupplier = async (id) => {
  return apiClient.delete(`${BASE_URL}/${id}`);
};
