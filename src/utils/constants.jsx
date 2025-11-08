// CSMS Application Constants

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  INVENTORY: '/inventory',
  EMPLOYEES: '/employees',
  ORDERS: '/orders',
  ORDER_QUEUE: '/order-queue',
  MENU: '/menu',
  REPORTS: '/reports',
  ATTENDANCE: '/attendance',
  ADMIN: '/em-mgmt',
  FINANCE: '/finance',
  SETTINGS: '/settings',
  NOT_FOUND: '/404'
};

// User Roles (matching database)
export const ROLES = {
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
  FINANCE: 'FINANCE',
  BARISTA: 'BARISTA'
};

// Product Status
export const PRODUCT_STATUS = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Unavailable'
};

// Order Status (matching backend exactly)
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Employee Status
export const EMPLOYEE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late'
};

// Salary Status
export const SALARY_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid'
};

// Transaction Types
export const TRANSACTION_TYPE = {
  IMPORT: 'Import',
  EXPORT: 'Export'
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Coffee',
  'Tea',
  'Cake',
  'Pastry',
  'Sandwich',
  'Beverage',
  'Other'
];

// Ingredient Units
export const INGREDIENT_UNITS = [
  'kg',
  'grams',
  'liters',
  'ml',
  'pieces',
  'cups'
];

// Employee Positions
export const EMPLOYEE_POSITIONS = [
  'Manager',
  'Barista',
  'Cashier',
  'Kitchen Staff',
  'Cleaner',
  'Finance'
];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const TIME_FORMAT = 'HH:mm';

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'csms_auth_token',
  USER_DATA: 'csms_user_data',
  THEME: 'csms_theme'
};

// Status Colors
export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#f59e0b',
  [ORDER_STATUS.PROCESSING]: '#3b82f6',
  [ORDER_STATUS.COMPLETED]: '#10b981',
  [ORDER_STATUS.CANCELLED]: '#ef4444',
  [EMPLOYEE_STATUS.ACTIVE]: '#10b981',
  [EMPLOYEE_STATUS.INACTIVE]: '#6b7280',
  [ATTENDANCE_STATUS.PRESENT]: '#10b981',
  [ATTENDANCE_STATUS.ABSENT]: '#ef4444',
  [ATTENDANCE_STATUS.LATE]: '#f59e0b',
  [SALARY_STATUS.PENDING]: '#f59e0b',
  [SALARY_STATUS.PAID]: '#10b981'
};
