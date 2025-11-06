import React, { useState } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from '../api/employeeApi.jsx';
import Card from '../components/common/Card/index.jsx';
import Button from '../components/common/Button/index.jsx';
import EmployeeModal from '../components/common/EmployeeModal/index.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog/index.jsx';
import { formatDate, formatPhone } from '../utils/formatters.jsx';
import './AdminPage.css';

const AdminPage = () => {
  const { data: employees, loading, refetch } = useApiQuery(getAllEmployees, {}, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, employeeId: null });

  const filteredEmployees = employees?.filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phone.includes(searchTerm)
  ) || [];

  const handleEmployeeSubmit = async (data) => {
    try {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, data);
        alert('Employee updated successfully!');
      } else {
        await createEmployee(data);
        alert('Employee created successfully!');
      }
      setIsEmployeeModalOpen(false);
      setSelectedEmployee(null);
      refetch();
    } catch (error) {
      alert('Error saving employee: ' + error.message);
    }
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleDeleteClick = (employeeId) => {
    setConfirmDelete({ isOpen: true, employeeId });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEmployee(confirmDelete.employeeId);
      alert('Employee deleted successfully!');
      setConfirmDelete({ isOpen: false, employeeId: null });
      refetch();
    } catch (error) {
      alert('Error deleting employee: ' + error.message);
    }
  };

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
          <Button variant="primary" onClick={() => {
            setSelectedEmployee(null);
            setIsEmployeeModalOpen(true);
          }}>
            + Add Employee
          </Button>
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
                      <Button variant="ghost" size="small" onClick={() => handleEditClick(employee)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="small" onClick={() => handleDeleteClick(employee.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleEmployeeSubmit}
        employee={selectedEmployee}
      />

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, employeeId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Employee?"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminPage;
