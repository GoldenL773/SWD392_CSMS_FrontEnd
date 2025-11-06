// CSMS Employee API

import apiClient from './apiClient.jsx';

/**
 * Get all employees with optional filters and pagination
 */
export const getAllEmployees = async (params = {}) => {
  const response = await apiClient.get('/employees', params);
  return response.content || response;
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (id) => {
  return apiClient.get(`/employees/${id}`);
};

/**
 * Get employee attendance records
 */
export const getEmployeeAttendance = async (employeeId, params = {}) => {
  const response = await apiClient.get(`/employees/${employeeId}/attendance`, params);
  return response.content || response;
};

/**
 * Get employee salary records
 */
export const getEmployeeSalary = async (employeeId, params = {}) => {
  const response = await apiClient.get(`/employees/${employeeId}/salary`, params);
  return response.content || response;
};

/**
 * Create new employee
 */
export const createEmployee = async (employeeData) => {
  return apiClient.post('/employees', employeeData);
};

/**
 * Update employee
 */
export const updateEmployee = async (id, employeeData) => {
  return apiClient.put(`/employees/${id}`, employeeData);
};

/**
 * Delete employee
 */
export const deleteEmployee = async (id) => {
  return apiClient.delete(`/employees/${id}`);
};

/**
 * Add attendance record
 */
export const addAttendance = async (attendanceData) => {
  return apiClient.post('/employees/attendance', attendanceData);
};

/**
 * Add salary record
 */
export const addSalary = async (salaryData) => {
  return apiClient.post('/employees/salary', salaryData);
};
