import React from 'react';
import PropTypes from 'prop-types';
import { formatDate, formatPhone } from '../../utils/formatters.jsx';
import './EmployeeCard.css';

/**
 * EmployeeCard Component
 * Grid card for employee display
 * Entity: Employee (id, firstName, lastName, phone, position, hireDate)
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
        {employee.firstName ? employee.firstName.charAt(0).toUpperCase() : '?'}
      </div>
      
      <div className="employee-card__info">
        <h3 className="employee-card__name">{`${employee.firstName || ''} ${employee.lastName || ''}`.trim()}</h3>
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
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    phone: PropTypes.string,
    position: PropTypes.string,
    hireDate: PropTypes.string,
    status: PropTypes.string
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool
};

export default EmployeeCard;
