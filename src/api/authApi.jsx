// CSMS Authentication API

import apiClient from './apiClient.jsx';
import { mockUsers, mockEmployees } from '../utils/mockData.jsx';
import { STORAGE_KEYS } from '../utils/constants.jsx';

/**
 * Login with username and password
 * Returns user data with token
 */
export const login = async (username, password) => {
  // TODO: Replace with actual API call
  // return apiClient.post('/auth/login', { username, password });
  
  // Mock implementation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.username === username);
      
      if (user && password === 'password') {
        const employee = mockEmployees.find(e => e.user?.id === user.id);
        
        const authData = {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: user.id,
            username: user.username,
            roles: user.roles,
            employee: employee ? {
              id: employee.id,
              fullName: employee.fullName,
              position: employee.position,
              status: employee.status
            } : null
          }
        };
        
        resolve(authData);
      } else {
        reject(new Error('Invalid username or password'));
      }
    }, 500);
  });
};

/**
 * Logout current user
 */
export const logout = async () => {
  // TODO: Replace with actual API call
  // return apiClient.post('/auth/logout');
  
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      resolve({ success: true });
    }, 200);
  });
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  // TODO: Replace with actual API call
  // return apiClient.get('/auth/me');
  
  // Mock implementation
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  if (userData) {
    return Promise.resolve(JSON.parse(userData));
  }
  return Promise.reject(new Error('Not authenticated'));
};

/**
 * Change password
 */
export const changePassword = async (oldPassword, newPassword) => {
  // TODO: Replace with actual API call
  // return apiClient.post('/auth/change-password', { oldPassword, newPassword });
  
  // Mock implementation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (oldPassword === 'password') {
        resolve({ success: true, message: 'Password changed successfully' });
      } else {
        reject(new Error('Current password is incorrect'));
      }
    }, 500);
  });
};
