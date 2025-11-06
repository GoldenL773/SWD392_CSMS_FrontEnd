import React from 'react';
import PropTypes from 'prop-types';
import { formatDate, formatPhone } from '../../utils/formatters.jsx';
import './EmployeeCard.css';

/**
 * EmployeeCard Component
 * Grid card for employee display
 * Entity: Employee (id, fullName, dob, gender, phone, position, hireDate, status)
 */
const EmployeeCard = ({ employee, onSelect, isSelected }) => {
  const getStatusClass = (status) => {
    return status === 'ACTIVE' ? 'status-active' : 'status-inactive';
  };

  return (
    <div 
      className={`employee-card ${isSelected ? 'employee-card--selected' : ''}`}
      onClick={() => onSelect(employee)}
    >
      <div className="employee-card__avatar">
        {employee.fullName.charAt(0).toUpperCase()}
      </div>
      
      <div className="employee-card__info">
        <h3 className="employee-card__name">{employee.fullName}</h3>
        <p className="employee-card__position">{employee.position}</p>
        
        <div className="employee-card__details">
          <span className="detail-item">
            📞 {formatPhone(employee.phone)}
          </span>
          <span className="detail-item">
            📅 {formatDate(employee.hireDate)}
          </span>
        </div>
        
        <span className={`status-badge ${getStatusClass(employee.status)}`}>
          {employee.status}
        </span>
      </div>
    </div>
  );
};

EmployeeCard.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.number.isRequired,
    fullName: PropTypes.string.isRequired,
    dob: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    hireDate: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool
};

export default EmployeeCard;
