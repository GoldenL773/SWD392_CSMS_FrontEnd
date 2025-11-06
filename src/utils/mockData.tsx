// CSMS Mock Data - Strictly matching ENTITIES.md

/**
 * Mock Users (matching User entity)
 */
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$...', // BCrypt hash (not used in frontend)
    roles: [{ id: 1, name: 'ROLE_ADMIN' }, { id: 2, name: 'ROLE_MANAGER' }]
  },
  {
    id: 2,
    username: 'manager01',
    password: '$2a$10$...',
    roles: [{ id: 2, name: 'ROLE_MANAGER' }]
  },
  {
    id: 3,
    username: 'staff01',
    password: '$2a$10$...',
    roles: [{ id: 3, name: 'ROLE_STAFF' }]
  }
];

/**
 * Mock Employees (matching Employee entity)
 */
export const mockEmployees = [
  {
    id: 1,
    fullName: 'Nguyen Van Admin',
    dob: '1990-05-15',
    gender: 'Male',
    phone: '0901234567',
    position: 'Manager',
    hireDate: '2020-01-15',
    status: 'Active',
    user: mockUsers[0]
  },
  {
    id: 2,
    fullName: 'Tran Thi Manager',
    dob: '1992-08-20',
    gender: 'Female',
    phone: '0902345678',
    position: 'Manager',
    hireDate: '2021-03-10',
    status: 'Active',
    user: mockUsers[1]
  },
  {
    id: 3,
    fullName: 'Le Van Barista',
    dob: '1995-11-30',
    gender: 'Male',
    phone: '0903456789',
    position: 'Barista',
    hireDate: '2022-06-01',
    status: 'Active',
    user: mockUsers[2]
  },
  {
    id: 4,
    fullName: 'Pham Thi Cashier',
    dob: '1998-02-14',
    gender: 'Female',
    phone: '0904567890',
    position: 'Cashier',
    hireDate: '2023-01-20',
    status: 'Active',
    user: null
  },
  {
    id: 5,
    fullName: 'Hoang Van Kitchen',
    dob: '1993-07-25',
    gender: 'Male',
    phone: '0905678901',
    position: 'Kitchen Staff',
    hireDate: '2021-09-15',
    status: 'Inactive',
    user: null
  }
];

/**
 * Mock Products (matching Product entity)
 */
export const mockProducts = [
  {
    id: 1,
    name: 'Espresso',
    category: 'Coffee',
    price: 45000,
    status: 'Available'
  },
  {
    id: 2,
    name: 'Cappuccino',
    category: 'Coffee',
    price: 55000,
    status: 'Available'
  },
  {
    id: 3,
    name: 'Latte',
    category: 'Coffee',
    price: 50000,
    status: 'Available'
  },
  {
    id: 4,
    name: 'Green Tea',
    category: 'Tea',
    price: 35000,
    status: 'Available'
  },
  {
    id: 5,
    name: 'Chocolate Cake',
    category: 'Cake',
    price: 65000,
    status: 'Available'
  },
  {
    id: 6,
    name: 'Croissant',
    category: 'Pastry',
    price: 40000,
    status: 'Unavailable'
  }
];

/**
 * Mock Ingredients (matching Ingredient entity)
 */
export const mockIngredients = [
  {
    id: 1,
    name: 'Coffee Beans',
    unit: 'kg',
    quantity: 50.5,
    pricePerUnit: 250000
  },
  {
    id: 2,
    name: 'Milk',
    unit: 'liters',
    quantity: 30.0,
    pricePerUnit: 25000
  },
  {
    id: 3,
    name: 'Sugar',
    unit: 'kg',
    quantity: 20.0,
    pricePerUnit: 15000
  },
  {
    id: 4,
    name: 'Tea Leaves',
    unit: 'kg',
    quantity: 10.5,
    pricePerUnit: 180000
  },
  {
    id: 5,
    name: 'Flour',
    unit: 'kg',
    quantity: 25.0,
    pricePerUnit: 20000
  },
  {
    id: 6,
    name: 'Chocolate',
    unit: 'kg',
    quantity: 8.5,
    pricePerUnit: 350000
  }
];

/**
 * Mock ProductIngredients (matching ProductIngredient entity)
 */
export const mockProductIngredients = [
  {
    id: 1,
    product: mockProducts[0], // Espresso
    ingredient: mockIngredients[0], // Coffee Beans
    quantityRequired: 0.02 // 20 grams
  },
  {
    id: 2,
    product: mockProducts[1], // Cappuccino
    ingredient: mockIngredients[0], // Coffee Beans
    quantityRequired: 0.02
  },
  {
    id: 3,
    product: mockProducts[1], // Cappuccino
    ingredient: mockIngredients[1], // Milk
    quantityRequired: 0.15 // 150ml
  }
];

/**
 * Mock Orders (matching Order entity)
 */
export const mockOrders = [
  {
    id: 1,
    employee: mockEmployees[2],
    orderDate: '2024-11-05T10:30:00',
    totalAmount: 150000,
    status: 'Completed',
    orderItems: []
  },
  {
    id: 2,
    employee: mockEmployees[3],
    orderDate: '2024-11-05T11:15:00',
    totalAmount: 95000,
    status: 'Pending',
    orderItems: []
  },
  {
    id: 3,
    employee: mockEmployees[2],
    orderDate: '2024-11-05T14:20:00',
    totalAmount: 220000,
    status: 'Preparing',
    orderItems: []
  }
];

/**
 * Mock OrderItems (matching OrderItem entity)
 */
export const mockOrderItems = [
  {
    id: 1,
    order: mockOrders[0],
    product: mockProducts[0],
    quantity: 2,
    price: 45000
  },
  {
    id: 2,
    order: mockOrders[0],
    product: mockProducts[4],
    quantity: 1,
    price: 65000
  },
  {
    id: 3,
    order: mockOrders[1],
    product: mockProducts[1],
    quantity: 1,
    price: 55000
  },
  {
    id: 4,
    order: mockOrders[1],
    product: mockProducts[3],
    quantity: 1,
    price: 35000
  }
];

// Link order items to orders
mockOrders[0].orderItems = [mockOrderItems[0], mockOrderItems[1]];
mockOrders[1].orderItems = [mockOrderItems[2], mockOrderItems[3]];

/**
 * Mock Attendance (matching Attendance entity)
 */
export const mockAttendance = [
  {
    id: 1,
    employee: mockEmployees[2],
    date: '2024-11-05',
    checkInTime: '08:00',
    checkOutTime: '17:00',
    workingHours: 8.0,
    overtimeHours: 0.0,
    status: 'Present'
  },
  {
    id: 2,
    employee: mockEmployees[3],
    date: '2024-11-05',
    checkInTime: '08:15',
    checkOutTime: '17:00',
    workingHours: 7.75,
    overtimeHours: 0.0,
    status: 'Late'
  },
  {
    id: 3,
    employee: mockEmployees[2],
    date: '2024-11-04',
    checkInTime: '08:00',
    checkOutTime: '18:30',
    workingHours: 9.5,
    overtimeHours: 1.5,
    status: 'Present'
  }
];

/**
 * Mock Salaries (matching Salary entity)
 */
export const mockSalaries = [
  {
    id: 1,
    employee: mockEmployees[0],
    month: 11,
    year: 2024,
    baseSalary: 20000000,
    bonus: 2000000,
    deduction: 0,
    totalSalary: 22000000,
    status: 'Paid'
  },
  {
    id: 2,
    employee: mockEmployees[1],
    month: 11,
    year: 2024,
    baseSalary: 15000000,
    bonus: 1500000,
    deduction: 0,
    totalSalary: 16500000,
    status: 'Paid'
  },
  {
    id: 3,
    employee: mockEmployees[2],
    month: 11,
    year: 2024,
    baseSalary: 8000000,
    bonus: 500000,
    deduction: 100000,
    totalSalary: 8400000,
    status: 'Pending'
  }
];

/**
 * Mock SalaryUpdatedHistory (matching SalaryUpdatedHistory entity)
 */
export const mockSalaryHistory = [
  {
    id: 1,
    salary: mockSalaries[2],
    changedBy: mockEmployees[0],
    changeDate: '2024-11-01',
    oldBaseSalary: 7500000,
    newBaseSalary: 8000000,
    oldBonus: 0,
    newBonus: 500000,
    oldDeduction: 0,
    newDeduction: 100000,
    oldTotalSalary: 7500000,
    newTotalSalary: 8400000,
    note: 'Performance increase'
  }
];

/**
 * Mock IngredientTransactions (matching IngredientTransaction entity)
 */
export const mockIngredientTransactions = [
  {
    id: 1,
    ingredient: mockIngredients[0],
    employee: mockEmployees[1],
    type: 'Import',
    quantity: 10.0,
    transactionDate: '2024-11-01T09:00:00',
    pricePerUnit: 250000,
    supplier: 'Coffee Supplier Co.',
    note: 'Monthly stock'
  },
  {
    id: 2,
    ingredient: mockIngredients[1],
    employee: mockEmployees[1],
    type: 'Import',
    quantity: 20.0,
    transactionDate: '2024-11-02T10:30:00',
    pricePerUnit: 25000,
    supplier: 'Dairy Farm',
    note: 'Weekly delivery'
  },
  {
    id: 3,
    ingredient: mockIngredients[0],
    employee: mockEmployees[2],
    type: 'Export',
    quantity: 0.5,
    transactionDate: '2024-11-05T11:00:00',
    pricePerUnit: 250000,
    supplier: null,
    note: 'Used for orders'
  }
];

/**
 * Mock DailyReports (matching DailyReport entity)
 */
export const mockDailyReports = [
  {
    id: 1,
    reportDate: '2024-11-05',
    totalOrders: 15,
    totalRevenue: 1850000,
    totalIngredientCost: 450000,
    totalSalaryPaid: 0,
    totalWorkingHours: 120.5,
    createdBy: mockEmployees[0],
    createdAt: '2024-11-05T18:00:00'
  },
  {
    id: 2,
    reportDate: '2024-11-04',
    totalOrders: 18,
    totalRevenue: 2100000,
    totalIngredientCost: 520000,
    totalSalaryPaid: 0,
    totalWorkingHours: 128.0,
    createdBy: mockEmployees[0],
    createdAt: '2024-11-04T18:00:00'
  },
  {
    id: 3,
    reportDate: '2024-11-03',
    totalOrders: 12,
    totalRevenue: 1650000,
    totalIngredientCost: 380000,
    totalSalaryPaid: 0,
    totalWorkingHours: 115.0,
    createdBy: mockEmployees[0],
    createdAt: '2024-11-03T18:00:00'
  }
];

/**
 * Mock Roles (matching Role entity)
 */
export const mockRoles = [
  { id: 1, name: 'ROLE_ADMIN' },
  { id: 2, name: 'ROLE_MANAGER' },
  { id: 3, name: 'ROLE_STAFF' }
];
