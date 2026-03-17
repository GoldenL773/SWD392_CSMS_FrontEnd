// CSMS Report API

import apiClient from './apiClient.jsx';

/**
 * Get daily reports with optional date range filter
 */
export const getDailyReports = async (params = {}) => {
  const response = await apiClient.get('/reports/daily', params);
  return response?.content || response || [];
};

/**
 * Get daily report by specific date
 */
export const getDailyReportByDate = async (date) => {
  return await apiClient.get(`/reports/daily/${date}`);
};

/**
 * Create daily report
 */
export const createDailyReport = async (reportData) => {
  return await apiClient.post('/reports/daily', reportData);
};

/**
 * Get ingredient transactions (using ingredient API)
 */
export const getIngredientTransactions = async (params = {}) => {
  const response = await apiClient.get('/transactions', params);
  return response?.content || response || [];
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  return await apiClient.get('/dashboard/stats');
};

// --- File Management APIs ---

/**
 * Upload a report file
 * @param {File} file - The file to upload
 * @param {Object} metadata - Report metadata (title, type, etc)
 */
export const uploadReportFile = async (file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', metadata.title);
  formData.append('description', metadata.description || '');
  formData.append('reportType', metadata.reportType);
  formData.append('reportPeriod', metadata.reportPeriod);

  return await apiClient.post('/reports/upload', formData);
};

/**
 * Get uploaded report files
 */
export const getUploadedReports = async (params = {}) => {
  try {
    const response = await apiClient.get('/reports/files', params);
    return response?.content || response || [];
  } catch (error) {
    console.warn('Failed to fetch uploaded reports (API might not be available):', error);
    return [];
  }
};

/**
 * Download a report file
 */
export const downloadReportFile = async (id, fallbackName) => {
  try {
    // We cannot use standard ApiClient.get for blob since it tries to parse JSON.
    // Let's use direct fetch to get a Blob.
    const token = localStorage.getItem('csms_auth_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`http://localhost:8080/api/reports/files/${id}/download`, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    let fileName = fallbackName || `report-${id}.pdf`;
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1];
      }
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};
