import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDate, formatPhone } from '../../utils/formatters.jsx';
import { useApiQuery } from '../../hooks/useApiQuery.jsx';
import { getEmployeeAttendance, getEmployeeSalary } from '../../api/employeeApi.jsx';
import Card from '../../components/common/Card/index.jsx';
import AttendanceTable from './AttendanceTable.jsx';
import SalaryView from './SalaryView.jsx';
import './EmployeeDetailView.css';

/**
 * EmployeeDetailView Component
 * Detailed view of employee with attendance and salary
 */
const EmployeeDetailView = ({ employee }) => {
  const [activeTab, setActiveTab] = useState('info');

  const { data: attendance, loading: attendanceLoading } = useApiQuery(
    () => getEmployeeAttendance(employee.id),
    {},
    [employee.id]
  );

  const { data: salary, loading: salaryLoading } = useApiQuery(
    () => getEmployeeSalary(employee.id),
    {},
    [employee.id]
  );

  return (
    <div className="employee-detail">
      <Card>
        <div className="employee-detail__header">
          <div className="employee-detail__avatar">
            {employee.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="employee-detail__header-info">
            <h2>{employee.fullName}</h2>
            <p className="position">{employee.position}</p>
          </div>
        </div>

        <div className="detail-tabs">
          <button
            className={`detail-tab ${activeTab === 'info' ? 'detail-tab--active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Information
          </button>
          <button
            className={`detail-tab ${activeTab === 'attendance' ? 'detail-tab--active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance
          </button>
          <button
            className={`detail-tab ${activeTab === 'salary' ? 'detail-tab--active' : ''}`}
            onClick={() => setActiveTab('salary')}
          >
            Salary
          </button>
        </div>

        <div className="detail-content">
          {activeTab === 'info' && (
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <span>{employee.fullName}</span>
              </div>
              <div className="info-item">
                <label>Date of Birth</label>
                <span>{formatDate(employee.dob)}</span>
              </div>
              <div className="info-item">
                <label>Gender</label>
                <span>{employee.gender}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span>{formatPhone(employee.phone)}</span>
              </div>
              <div className="info-item">
                <label>Position</label>
                <span>{employee.position}</span>
              </div>
              <div className="info-item">
                <label>Hire Date</label>
                <span>{formatDate(employee.hireDate)}</span>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span className={`status-badge ${employee.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                  {employee.status}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <AttendanceTable 
              attendance={attendance || []} 
              loading={attendanceLoading}
            />
          )}

          {activeTab === 'salary' && (
            <SalaryView 
              salary={salary || []} 
              loading={salaryLoading}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

EmployeeDetailView.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.number.isRequired,
    fullName: PropTypes.string.isRequired,
    dob: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    hireDate: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired
};

export default EmployeeDetailView;
