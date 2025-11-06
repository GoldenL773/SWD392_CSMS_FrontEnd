// CSMS Authentication API

import apiClient from './apiClient.jsx';
import { STORAGE_KEYS } from '../utils/constants.jsx';

/**
 * Login with username and password
 * Returns user data with token
 */
export const login = async (username, password) => {
  const response = await apiClient.post('/auth/login', { username, password });
  
  // Store token and user data
  if (response.token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response));
  }
  
  return response;
};

/**
 * Register new user
 */
export const register = async (userData) => {
  return apiClient.post('/auth/register', userData);
};

/**
 * Logout current user
 */
export const logout = async () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  return { success: true };
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  return apiClient.get('/auth/me');
};

/**
 * Change password
 */
export const changePassword = async (oldPassword, newPassword) => {
  return apiClient.post('/auth/change-password', { oldPassword, newPassword });
};
