import React, { useState } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.tsx';
import { getAllEmployees } from '../api/employeeApi.tsx';
import Card from '../components/common/Card/index.tsx';
import Button from '../components/common/Button/index.tsx';
import { formatDate, formatPhone } from '../utils/formatters.tsx';
import './AdminPage.css';

const AdminPage = () => {
  const { data: employees, loading } = useApiQuery(getAllEmployees, {}, []);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees?.filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phone.includes(searchTerm)
  ) || [];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage employees and system users</p>
      </div>

      <Card
        title="Employee Management"
        subtitle={`${filteredEmployees.length} employee${filteredEmployees.length !== 1 ? 's' : ''}`}
        actions={
          <Button variant="primary">Add Employee</Button>
        }
      >
        <div className="admin-controls">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading"></div>
            <p>Loading employees...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Phone</th>
                  <th>Position</th>
                  <th>Hire Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td className="employee-name">{employee.fullName}</td>
                    <td>{formatPhone(employee.phone)}</td>
                    <td>{employee.position}</td>
                    <td>{formatDate(employee.hireDate)}</td>
                    <td>
                      <span className={`status-badge ${employee.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Button variant="ghost" size="small">Edit</Button>
                      <Button variant="ghost" size="small">Roles</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminPage;
