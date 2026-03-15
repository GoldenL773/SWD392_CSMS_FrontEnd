import React, { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Calendar, 
  CaretLeft, 
  CaretRight, 
  CheckCircle, 
  ArrowClockwise
} from '@phosphor-icons/react';
import './DateRangePicker.css';

/**
 * DateRangePicker - Inline card component for date range filtering.
 * Always visible as a card, not a dropdown.
 * Matches the reference design with quick select pills, dual calendars,
 * FROM/TO inputs, Apply Filter / Reset to Default buttons, and info bar.
 */
const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [viewDate, setViewDate] = useState(() => {
    const date = startDate ? new Date(startDate) : new Date();
    return isNaN(date.getTime()) ? new Date() : date;
  });

  // Synchronize temp state when props change
  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    if (startDate) {
      setViewDate(new Date(startDate));
    }
  }, [startDate, endDate]);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDateClick = (day, monthOffset = 0) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day);
    clickedDate.setHours(0, 0, 0, 0);

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(clickedDate);
      setTempEndDate(null);
    } else if (tempStartDate && !tempEndDate) {
      if (clickedDate < tempStartDate) {
        setTempStartDate(clickedDate);
        setTempEndDate(null);
      } else {
        setTempEndDate(clickedDate);
      }
    }
  };

  const isSelected = (day, monthOffset) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day);
    d.setHours(0, 0, 0, 0);
    if (tempStartDate && d.getTime() === new Date(tempStartDate).setHours(0,0,0,0)) return true;
    if (tempEndDate && d.getTime() === new Date(tempEndDate).setHours(0,0,0,0)) return true;
    return false;
  };

  const isInRange = (day, monthOffset) => {
    if (!tempStartDate || !tempEndDate) return false;
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day);
    d.setHours(0, 0, 0, 0);
    return d > tempStartDate && d < tempEndDate;
  };

  const isRangeStart = (day, monthOffset) => {
    if (!tempStartDate) return false;
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === new Date(tempStartDate).setHours(0,0,0,0);
  };

  const isRangeEnd = (day, monthOffset) => {
    if (!tempEndDate) return false;
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, day);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === new Date(tempEndDate).setHours(0,0,0,0);
  };

  const changeMonth = (offset) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const renderMonth = (monthOffset) => {
    const targetMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + monthOffset, 1);
    const daysInMonth = getDaysInMonth(targetMonth.getFullYear(), targetMonth.getMonth());
    const firstDay = getFirstDayOfMonth(targetMonth.getFullYear(), targetMonth.getMonth());
    const days = [];

    const prevMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(<div key={`prev-${i}`} className="drp-day drp-day--ghost">{prevMonthDays - i}</div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const selected = isSelected(i, monthOffset);
      const inRange = isInRange(i, monthOffset);
      const rangeStart = isRangeStart(i, monthOffset);
      const rangeEnd = isRangeEnd(i, monthOffset);
      
      const classes = [
        'drp-day',
        selected ? 'drp-day--selected' : '',
        inRange ? 'drp-day--in-range' : '',
        rangeStart ? 'drp-day--range-start' : '',
        rangeEnd ? 'drp-day--range-end' : ''
      ].filter(Boolean).join(' ');
      
      days.push(
        <div 
          key={`day-${i}`} 
          className={classes}
          onClick={() => handleDateClick(i, monthOffset)}
        >
          {i}
        </div>
      );
    }

    const totalCells = 42; 
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(<div key={`next-${i}`} className="drp-day drp-day--ghost">{i}</div>);
    }

    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleApply = () => {
    onChange(tempStartDate, tempEndDate);
  };

  const handleReset = () => {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    defaultStart.setHours(0,0,0,0);
    const defaultEnd = new Date();
    defaultEnd.setHours(0,0,0,0);
    setTempStartDate(defaultStart);
    setTempEndDate(defaultEnd);
    onChange(defaultStart, defaultEnd);
  };

  const handleQuickSelect = (type) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let start = new Date(now);
    let end = new Date(now);

    switch (type) {
      case 'today':
        break;
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        end.setDate(now.getDate() - 1);
        break;
      case 'last7':
        start.setDate(now.getDate() - 6);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last30':
        start.setDate(now.getDate() - 29);
        break;
      default:
        break;
    }

    setTempStartDate(start);
    setTempEndDate(end);
    setViewDate(new Date(start));
  };

  const daysDiff = useMemo(() => {
    if (!tempStartDate || !tempEndDate) return 0;
    const diffTime = Math.abs(tempEndDate - tempStartDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [tempStartDate, tempEndDate]);

  // Compute previous period for display
  const prevPeriodLabel = useMemo(() => {
    if (!tempStartDate || !tempEndDate || daysDiff <= 0) return '';
    const prevEnd = new Date(tempStartDate);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - daysDiff + 1);
    return `${prevStart.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${prevEnd.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`;
  }, [tempStartDate, tempEndDate, daysDiff]);

  const rightMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

  return (
    <div className="drp-card">
      {/* Header */}
      <div className="drp-header">
        <h2 className="drp-title">
          <Calendar size={22} weight="fill" />
          Filter by Date
        </h2>
      </div>

      {/* Quick Select Pills */}
      <div className="drp-pills">
        <button className="drp-pill" onClick={() => handleQuickSelect('today')}>Today</button>
        <button className="drp-pill" onClick={() => handleQuickSelect('yesterday')}>Yesterday</button>
        <button className="drp-pill" onClick={() => handleQuickSelect('last7')}>Last 7 Days</button>
        <button className="drp-pill" onClick={() => handleQuickSelect('thisMonth')}>This Month</button>
        <button className="drp-pill" onClick={() => handleQuickSelect('last30')}>Last 30 Days</button>
      </div>

      {/* Main Content: FROM/TO + Calendars */}
      <div className="drp-body">
        {/* Left: FROM / TO inputs + actions */}
        <div className="drp-sidebar">
          <div className="drp-field">
            <label className="drp-label">FROM</label>
            <div className="drp-input-wrap">
              <Calendar size={18} className="drp-input-icon" />
              <input className="drp-input" readOnly value={formatDate(tempStartDate) || 'Select date'} />
            </div>
          </div>
          <div className="drp-field">
            <label className="drp-label">TO</label>
            <div className="drp-input-wrap">
              <Calendar size={18} className="drp-input-icon" />
              <input className="drp-input" readOnly value={formatDate(tempEndDate) || 'Select date'} />
            </div>
          </div>
          <button className="drp-apply-btn" onClick={handleApply}>
            Apply Filter
            <CheckCircle size={18} weight="fill" />
          </button>
          <button className="drp-reset-btn" onClick={handleReset}>
            <ArrowClockwise size={16} />
            Reset to Default
          </button>
        </div>

        {/* Right: Dual Calendars */}
        <div className="drp-calendars">
          <div className="drp-duo">
            {/* Left Calendar */}
            <div className="drp-cal">
              <div className="drp-cal-header">
                <button className="drp-nav-btn" onClick={() => changeMonth(-1)}><CaretLeft size={18} /></button>
                <span className="drp-month-label">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                <div style={{width: 28}}></div>
              </div>
              <div className="drp-weekdays">
                <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
              </div>
              <div className="drp-days">{renderMonth(0)}</div>
            </div>

            {/* Right Calendar */}
            <div className="drp-cal">
              <div className="drp-cal-header">
                <div style={{width: 28}}></div>
                <span className="drp-month-label">{monthNames[rightMonthDate.getMonth()]} {rightMonthDate.getFullYear()}</span>
                <button className="drp-nav-btn" onClick={() => changeMonth(1)}><CaretRight size={18} /></button>
              </div>
              <div className="drp-weekdays">
                <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
              </div>
              <div className="drp-days">{renderMonth(1)}</div>
            </div>
          </div>

          {/* Info Bar */}
          <div className="drp-info-bar">
            <div className="drp-info-badge">
              <div className="drp-info-icon">
                <CheckCircle size={18} weight="fill" />
              </div>
              <div className="drp-info-text">
                <strong>{daysDiff} Days selected.</strong>
                {prevPeriodLabel && (
                  <span className="drp-info-sub">Compared to previous period: {prevPeriodLabel}</span>
                )}
              </div>
            </div>
            <span className="drp-mode-tag">RANGE MODE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

DateRangePicker.propTypes = {
  startDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  endDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  onChange: PropTypes.func.isRequired,
};

export default DateRangePicker;
