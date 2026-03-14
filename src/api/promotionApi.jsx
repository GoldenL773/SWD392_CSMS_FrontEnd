import apiClient from './apiClient.jsx';

const BASE_URL = '/promotions';

export const getAllPromotions = async (params = {}) => {
  const response = await apiClient.get(BASE_URL, params);
  return response?.content || response || [];
};

export const getPromotionById = async (id) => {
  return apiClient.get(`${BASE_URL}/${id}`);
};

export const createPromotion = async (data) => {
  return apiClient.post(BASE_URL, data);
};

export const updatePromotion = async (id, data) => {
  return apiClient.put(`${BASE_URL}/${id}`, data);
};

export const deletePromotion = async (id) => {
  return apiClient.delete(`${BASE_URL}/${id}`);
};
