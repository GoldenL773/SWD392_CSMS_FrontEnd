import React from 'react';
import PropTypes from 'prop-types';
import './DateRangePicker.css';

/**
 * DateRangePicker Component
 * Reusable date range selector with presets (Today, This Week, This Month)
 */
const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange, label }) => {
  const today = new Date();
  
  const applyPreset = (preset) => {
    const end = new Date();
    let start = new Date();
    
    switch (preset) {
      case 'today':
        start = new Date(end);
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      default:
        return;
    }
    
    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
  };

  return (
    <div className="date-range-picker">
      {label && <label className="date-range-label">{label}</label>}
      
      {/* Presets */}
      <div className="date-presets">
        <button
          className="preset-btn"
          onClick={() => applyPreset('today')}
          title="Today"
        >
          Today
        </button>
        <button
          className="preset-btn"
          onClick={() => applyPreset('week')}
          title="Last 7 days"
        >
          This Week
        </button>
        <button
          className="preset-btn"
          onClick={() => applyPreset('month')}
          title="Last 30 days"
        >
          This Month
        </button>
      </div>

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
