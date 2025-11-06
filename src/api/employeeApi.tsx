// CSMS Employee API

import { mockEmployees, mockAttendance, mockSalaries } from '../utils/mockData.tsx';

export const getAllEmployees = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let employees = [...mockEmployees];
      if (params.status) {
        employees = employees.filter(e => e.status === params.status);
      }
      resolve(employees);
    }, 300);
  });
};

export const getEmployeeById = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const employee = mockEmployees.find(e => e.id === parseInt(id));
      employee ? resolve(employee) : reject(new Error('Employee not found'));
    }, 300);
  });
};

export const getEmployeeAttendance = async (employeeId, params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const attendance = mockAttendance.filter(a => a.employee.id === parseInt(employeeId));
      resolve(attendance);
    }, 300);
  });
};

export const getEmployeeSalary = async (employeeId, params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const salaries = mockSalaries.filter(s => s.employee.id === parseInt(employeeId));
      resolve(salaries);
    }, 300);
  });
};

export const createEmployee = async (employeeData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: mockEmployees.length + 1, ...employeeData });
    }, 500);
  });
};

export const updateEmployee = async (id, employeeData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const employee = mockEmployees.find(e => e.id === parseInt(id));
      employee ? resolve({ ...employee, ...employeeData }) : reject(new Error('Employee not found'));
    }, 500);
  });
};
