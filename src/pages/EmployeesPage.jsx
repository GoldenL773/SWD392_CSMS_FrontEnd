import React, { useState } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllEmployees } from '../api/employeeApi.jsx';
import EmployeeCard from '../features/employees/EmployeeCard.jsx';
import EmployeeDetailView from '../features/employees/EmployeeDetailView.jsx';
import './EmployeesPage.css';

const EmployeesPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const { data: employees, loading } = useApiQuery(getAllEmployees, {}, []);

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Employee Management</h1>
        <p>Manage employee profiles, attendance, and salary</p>
      </div>

      <div className="employees-layout">
        <div className="employees-list">
          <h2>Employees ({employees?.length || 0})</h2>
          {loading && (
            <div className="loading-container">
              <div className="loading"></div>
              <p>Loading employees...</p>
            </div>
          )}
          {!loading && employees && employees.length > 0 && (
            <div className="employees-grid">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onSelect={setSelectedEmployee}
                  isSelected={selectedEmployee?.id === employee.id}
                />
              ))}
            </div>
          )}
          {!loading && (!employees || employees.length === 0) && (
            <div className="empty-state">
              <p>No employees found</p>
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
