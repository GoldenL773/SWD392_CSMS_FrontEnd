import apiClient from './apiClient.jsx';

/**
 * Attendance API endpoints
 */

// Check-in (date = yyyy-MM-dd theo múi giờ local để lưu đúng ngày user)
export const checkIn = (employeeId, date) => {
  const options = date ? { params: { date } } : {};
  return apiClient.post(`/attendance/check-in/${employeeId}`, null, options);
};

// Check-out (date = yyyy-MM-dd theo múi giờ local)
export const checkOut = (employeeId, date) => {
  const options = date ? { params: { date } } : {};
  return apiClient.post(`/attendance/check-out/${employeeId}`, null, options);
};

// Get today's attendance
export const getTodayAttendance = async (employeeId) => {
  if (!employeeId) return null;
  // Use local date instead of UTC to avoid timezone issues (e.g., UTC might be previous day)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDate = `${year}-${month}-${day}`;
  
  const response = await apiClient.get(`/attendance/date/${localDate}`, { employeeId }, { ignoreUnauthorized: true });
  return Array.isArray(response) && response.length > 0 ? response[0] : null;
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
