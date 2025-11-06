import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal/index.jsx';
import Button from '../Button/index.jsx';
import { EMPLOYEE_POSITIONS, EMPLOYEE_STATUS } from '../../../utils/constants.jsx';
import './EmployeeModal.css';

/**
 * EmployeeModal Component
 * Modal for creating/editing employees
 * Entity: Employee (fullName, position, phone, email, hireDate, salary, status)
 */
const EmployeeModal = ({ isOpen, onClose, onSubmit, employee }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    position: EMPLOYEE_POSITIONS[0],
    phone: '',
    email: '',
    hireDate: new Date().toISOString().split('T')[0],
    salary: '',
    status: EMPLOYEE_STATUS.ACTIVE,
    password: '' // Only for new employees
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        fullName: employee.fullName || '',
        position: employee.position || EMPLOYEE_POSITIONS[0],
        phone: employee.phone || '',
        email: employee.email || '',
        hireDate: employee.hireDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        salary: employee.salary?.toString() || '',
        status: employee.status || EMPLOYEE_STATUS.ACTIVE
      });
    } else {
      setFormData({
        fullName: '',
        position: EMPLOYEE_POSITIONS[0],
        phone: '',
        email: '',
        hireDate: new Date().toISOString().split('T')[0],
        salary: '',
        status: EMPLOYEE_STATUS.ACTIVE,
        password: ''
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.salary || parseFloat(formData.salary) <= 0) {
      newErrors.salary = 'Valid salary is required';
    }
    // Password validation (only for new employees)
    if (!employee) {
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      ...formData,
      salary: parseFloat(formData.salary)
    };

    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Edit Employee' : 'Add New Employee'}
      size="large"
    >
      <form className="employee-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'error' : ''}
              placeholder="Enter full name"
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="position">Position *</label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
            >
              {EMPLOYEE_POSITIONS.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="0123456789"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="email@example.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {!employee && (
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Minimum 6 characters"
                minLength="6"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="hireDate">Hire Date *</label>
            <input
              type="date"
              id="hireDate"
              name="hireDate"
              value={formData.hireDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="salary">Monthly Salary (VND) *</label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              min="0"
              step="100000"
              className={errors.salary ? 'error' : ''}
              placeholder="10000000"
            />
            {errors.salary && <span className="error-message">{errors.salary}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value={EMPLOYEE_STATUS.ACTIVE}>Active</option>
              <option value={EMPLOYEE_STATUS.INACTIVE}>Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {employee ? 'Update Employee' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

EmployeeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  employee: PropTypes.object
};

export default EmployeeModal;
