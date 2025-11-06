import React from 'react';
import PropTypes from 'prop-types';
import './DateRangePicker.css';

/**
 * DateRangePicker Component
 * Reusable date range selector with from/to dates
 */
const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange, label }) => {
  return (
    <div className="date-range-picker">
      {label && <label className="date-range-label">{label}</label>}
      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date">From</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="date-input"
          />
        </div>
        <span className="date-separator">—</span>
        <div className="date-input-group">
          <label htmlFor="end-date">To</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="date-input"
            min={startDate}
          />
        </div>
      </div>
    </div>
  );
};

DateRangePicker.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  onStartDateChange: PropTypes.func.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  label: PropTypes.string
};

export default DateRangePicker;
