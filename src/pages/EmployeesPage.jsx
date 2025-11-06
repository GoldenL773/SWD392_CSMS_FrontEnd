import React, { useState, useMemo } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllEmployees } from '../api/employeeApi.jsx';
import EmployeeCard from '../features/employees/EmployeeCard.jsx';
import EmployeeDetailView from '../features/employees/EmployeeDetailView.jsx';
import './EmployeesPage.css';

const EmployeesPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: employeesData, loading } = useApiQuery(getAllEmployees, { size: 1000 }, []);
  const employees = employeesData?.content || employeesData || [];

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    
    const search = searchTerm.toLowerCase().trim();
    return employees.filter(emp =>
      emp.fullName?.toLowerCase().includes(search) ||
      emp.position?.toLowerCase().includes(search) ||
      emp.email?.toLowerCase().includes(search) ||
      emp.phone?.includes(search)
    );
  }, [employees, searchTerm]);

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Employee Management</h1>
        <p>Manage employee profiles, attendance, and salary</p>
      </div>

      <div className="employees-layout">
        <div className="employees-list">
          <div className="employees-list-header">
            <h2>Employees ({filteredEmployees?.length || 0})</h2>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, position, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {loading && (
            <div className="loading-container">
              <div className="loading"></div>
              <p>Loading employees...</p>
            </div>
          )}
          {!loading && filteredEmployees && filteredEmployees.length > 0 && (
            <div className="employees-grid">
              {filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onSelect={setSelectedEmployee}
                  isSelected={selectedEmployee?.id === employee.id}
                />
              ))}
            </div>
          )}
          {!loading && (!filteredEmployees || filteredEmployees.length === 0) && (
            <div className="empty-state">
              <p>{searchTerm ? 'No employees match your search' : 'No employees found'}</p>
            </div>
          )}
        </div>

        <div className="employee-detail-panel">
          {selectedEmployee ? (
            <EmployeeDetailView employee={selectedEmployee} />
          ) : (
            <div className="no-selection">
              <p>Select an employee to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
