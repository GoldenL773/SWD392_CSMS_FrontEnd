import apiClient from './apiClient.jsx';

/**
 * Attendance API endpoints
 */

// Check-in
export const checkIn = (employeeId) => {
  return apiClient.post(`/attendance/check-in/${employeeId}`);
};

// Check-out
export const checkOut = (employeeId) => {
  return apiClient.post(`/attendance/check-out/${employeeId}`);
};

// Get today's attendance
export const getTodayAttendance = (employeeId) => {
  return apiClient.get(`/attendance/today/${employeeId}`);
};

// Get attendance by ID
export const getAttendanceById = (id) => {
  return apiClient.get(`/attendance/${id}`);
};

// Get all attendance for an employee
export const getEmployeeAttendance = (employeeId, params = {}) => {
  // apiClient.get expects a plain params object as the second argument
  return apiClient.get(`/attendance/employee/${employeeId}`, params);
};

// Get attendance by date range
export const getEmployeeAttendanceByDateRange = (employeeId, startDate, endDate) => {
  // send startDate and endDate as query params (plain object)
  return apiClient.get(`/attendance/employee/${employeeId}/range`, { startDate, endDate });
};

// Get attendance for a specific date
export const getAttendanceByDate = (date) => {
  return apiClient.get(`/attendance/date/${date}`);
};

// Create or update attendance (for managers)
export const createOrUpdateAttendance = (data) => {
  return apiClient.post('/attendance', data);
};

// Delete attendance
export const deleteAttendance = (id) => {
  return apiClient.delete(`/attendance/${id}`);
};

// Get total working hours
export const getTotalWorkingHours = (employeeId, startDate, endDate) => {
  return apiClient.get(`/attendance/employee/${employeeId}/total-hours`, { startDate, endDate });
};
