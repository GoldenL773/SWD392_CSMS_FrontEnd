// CSMS Report API

import apiClient from './apiClient.jsx';

/**
 * Get daily reports with optional date range filter
 */
export const getDailyReports = async (params = {}) => {
  const response = await apiClient.get('/reports/daily', params);
  return response.content || response;
};

/**
 * Get daily report by specific date
 */
export const getDailyReportByDate = async (date) => {
  return apiClient.get(`/reports/daily/${date}`);
};

/**
 * Create daily report
 */
export const createDailyReport = async (reportData) => {
  return apiClient.post('/reports/daily', reportData);
};

/**
 * Get ingredient transactions (using ingredient API)
 */
export const getIngredientTransactions = async (params = {}) => {
  const response = await apiClient.get('/reports/transactions', params);
  return response.content || response;
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  return apiClient.get('/dashboard/stats');
};
