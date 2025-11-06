import apiClient from './apiClient.jsx';

/**
 * Salary API endpoints
 */

// Calculate monthly salaries
export const calculateMonthlySalaries = (month, year) => {
  return apiClient.post('/salaries/calculate', null, {
    params: { month, year }
  });
};

// Get salary by ID
export const getSalaryById = (id) => {
  return apiClient.get(`/salaries/${id}`);
};

// Get all salaries for an employee
export const getEmployeeSalaries = (employeeId) => {
  return apiClient.get(`/salaries/employee/${employeeId}`);
};

// Get salaries by period
export const getSalariesByPeriod = (month, year) => {
  return apiClient.get('/salaries/period', {
    params: { month, year }
  });
};

// Get pending salaries
export const getPendingSalaries = () => {
  return apiClient.get('/salaries/pending');
};

// Create or update salary
export const createOrUpdateSalary = (data) => {
  return apiClient.post('/salaries', data);
};

// Update salary adjustments
export const updateSalaryAdjustments = (id, adjustments) => {
  return apiClient.patch(`/salaries/${id}/adjustments`, adjustments);
};

// Mark as paid
export const markSalaryAsPaid = (id) => {
  return apiClient.patch(`/salaries/${id}/mark-paid`);
};

// Mark multiple as paid
export const markMultipleSalariesAsPaid = (ids) => {
  return apiClient.post('/salaries/mark-paid-batch', ids);
};

// Delete salary
export const deleteSalary = (id) => {
  return apiClient.delete(`/salaries/${id}`);
};

// Get total paid
export const getTotalSalaryPaid = (month, year) => {
  return apiClient.get('/salaries/total-paid', {
    params: { month, year }
  });
};

// Get all paid salaries
export const getPaidSalaries = () => {
  return apiClient.get('/salaries/paid');
};

// Get paid salaries by period
export const getPaidSalariesByPeriod = (month, year) => {
  return apiClient.get('/salaries/paid/period', {
    params: { month, year }
  });
};
