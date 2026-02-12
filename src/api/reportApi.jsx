// CSMS Report API

import apiClient from './apiClient.jsx';

/**
 * Get daily reports with optional date range filter
 */
export const getDailyReports = async (params = {}) => {
  const response = await apiClient.get('/reports/daily', { params });
  return response.data?.content || response.data || response;
};

/**
 * Get daily report by specific date
 */
export const getDailyReportByDate = async (date) => {
  const response = await apiClient.get(`/reports/daily/${date}`);
  return response.data;
};

/**
 * Create daily report
 */
export const createDailyReport = async (reportData) => {
  const response = await apiClient.post('/reports/daily', reportData);
  return response.data;
};

/**
 * Get ingredient transactions (using ingredient API)
 */
export const getIngredientTransactions = async (params = {}) => {
  const response = await apiClient.get('/reports/transactions', { params });
  return response.data?.content || response.data || response;
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
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

  const response = await apiClient.post('/reports/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Get uploaded report files
 */
export const getUploadedReports = async (params = {}) => {
  const response = await apiClient.get('/reports/files', { params });
  return response.data?.content || response.data || response;
};

/**
 * Download a report file
 */
export const downloadReportFile = async (id) => {
  // For download, we might need a blob response or just get a signed URL
  // Assuming the API returns a URL or we redirect
  const response = await apiClient.get(`/reports/files/${id}/download`, {
    responseType: 'blob'
  });
  
  // Create a blob link to download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  // Try to get filename from content-disposition header
  const contentDisposition = response.headers['content-disposition'];
  let fileName = `report-${id}.pdf`; // Default
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
    if (fileNameMatch && fileNameMatch.length === 2)
      fileName = fileNameMatch[1];
  }
  
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
