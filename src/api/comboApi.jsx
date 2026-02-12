import apiClient from './apiClient';

const BASE_URL = '/combos';

export const getAllCombos = async (params) => {
  const response = await apiClient.get(BASE_URL, { params });
  return response.data;
};

export const getComboById = async (id) => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const createCombo = async (data) => {
  const response = await apiClient.post(BASE_URL, data);
  return response.data;
};

export const updateCombo = async (id, data) => {
  const response = await apiClient.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteCombo = async (id) => {
  const response = await apiClient.delete(`${BASE_URL}/${id}`);
  return response.data;
};
