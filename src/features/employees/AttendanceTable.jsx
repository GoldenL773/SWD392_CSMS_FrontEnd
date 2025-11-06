import React from 'react';
import PropTypes from 'prop-types';
import { formatDate, formatTime, formatNumber } from '../../utils/formatters.jsx';
import './AttendanceTable.css';

/**
 * AttendanceTable Component
 * Displays attendance records
 * Entity: Attendance (id, date, checkInTime, checkOutTime, workingHours, status)
 */
const AttendanceTable = ({ attendance, loading }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'PRESENT': return 'status-present';
      case 'ABSENT': return 'status-absent';
      case 'LATE': return 'status-late';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading"></div>
        <p>Loading attendance...</p>
      </div>
    );
  }

  if (attendance.length === 0) {
    return (
      <div className="table-empty">
        <p>No attendance records found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Working Hours</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => (
            <tr key={record.id}>
              <td>{formatDate(record.date)}</td>
              <td>{record.checkInTime ? formatTime(record.checkInTime) : '-'}</td>
              <td>{record.checkOutTime ? formatTime(record.checkOutTime) : '-'}</td>
              <td className="hours-cell">
                {formatNumber(record.workingHours, 1)} hrs
              </td>
              <td>
                <span className={`status-badge ${getStatusClass(record.status)}`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

AttendanceTable.propTypes = {
  attendance: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    checkInTime: PropTypes.string,
    checkOutTime: PropTypes.string,
    workingHours: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired
  })).isRequired,
  loading: PropTypes.bool
};

export default AttendanceTable;
