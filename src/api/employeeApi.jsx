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
 * Attempt to resolve the employee profile for the given user.
 * Tries a few endpoints/filters in a best-effort order:
 * 1) GET /employees?userId={user.id} (via getAllEmployees)
 * 2) GET /employees/user/{userId}
 * 3) GET /employees/me
 * 4) GET /employees/{userId}
 * Throws if none of the attempts succeed.
 */
export const getEmployeeForUser = async (user) => {
  if (!user) throw new Error('No user provided');

  // 1) Try filtered list (many backends support query filters)
  try {
    const list = await getAllEmployees({ userId: user.id });
    if (Array.isArray(list) && list.length > 0) return list[0];
  } catch (err) {
    // ignore and try next
  }

  // 2) Try a user-scoped endpoint
  try {
    const byUser = await apiClient.get(`/employees/user/${user.id}`);
    if (byUser) return byUser;
  } catch (err) {
    // ignore and try next
  }

  // 3) Try a "me" endpoint
  try {
    const me = await apiClient.get('/employees/me');
    if (me) return me;
  } catch (err) {
    // ignore and try next
  }

  // 4) As a last resort try by id (some systems use same id for user/employee)
  try {
    const byId = await getEmployeeById(user.id);
    if (byId) return byId;
  } catch (err) {
    // ignore
  }

  throw new Error('Employee profile not found for user');
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
