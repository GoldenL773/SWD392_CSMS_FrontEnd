import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { 
  checkIn, 
  checkOut, 
  getTodayAttendance,
  getEmployeeAttendanceByDateRange 
} from '../api/attendanceApi.jsx';
import Card from '../components/common/Card/index.jsx';
import Button from '../components/common/Button/index.jsx';
import DateRangePicker from '../components/common/DateRangePicker/index.jsx';
import ToastContainer from '../components/common/Toast/ToastContainer.jsx';
import { formatDate, formatTime } from '../utils/formatters.jsx';
import './AttendancePage.css';

const AttendancePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  // Date range for history
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Fetch today's attendance
  const { data: todayAttendance, loading: todayLoading, refetch: refetchToday } = useApiQuery(
    getTodayAttendance,
    user?.id,
    [user?.id]
  );
  
  // Fetch attendance history
  const { data: attendanceHistory, loading: historyLoading, refetch: refetchHistory } = useApiQuery(
    () => getEmployeeAttendanceByDateRange(user?.id, startDate, endDate),
    {},
    [user?.id, startDate, endDate]
  );
  
  // Check-in mutation
  const { mutate: performCheckIn, loading: checkingIn } = useApiMutation(checkIn);
  
  // Check-out mutation
  const { mutate: performCheckOut, loading: checkingOut } = useApiMutation(checkOut);
  
  // Handle check-in
  const handleCheckIn = useCallback(async () => {
    try {
      await performCheckIn(user?.id);
      toast.addToast('Checked in successfully!', 'success');
      refetchToday();
      refetchHistory();
    } catch (error) {
      toast.addToast(error.message || 'Failed to check in', 'error');
    }
  }, [user?.id, performCheckIn, toast, refetchToday, refetchHistory]);
  
  // Handle check-out
  const handleCheckOut = useCallback(async () => {
    try {
      await performCheckOut(user?.id);
      toast.addToast('Checked out successfully!', 'success');
      refetchToday();
      refetchHistory();
    } catch (error) {
      toast.addToast(error.message || 'Failed to check out', 'error');
    }
  }, [user?.id, performCheckOut, toast, refetchToday, refetchHistory]);
  
  // Calculate attendance stats
  const stats = useMemo(() => {
    if (!attendanceHistory || attendanceHistory.length === 0) {
      return { totalDays: 0, presentDays: 0, lateDays: 0, totalHours: 0 };
    }
    
    const totalDays = attendanceHistory.length;
    const presentDays = attendanceHistory.filter(a => a.status === 'Present').length;
    const lateDays = attendanceHistory.filter(a => a.status === 'Late').length;
    const totalHours = attendanceHistory.reduce((sum, a) => sum + (a.totalHours || 0), 0);
    
    return { totalDays, presentDays, lateDays, totalHours };
  }, [attendanceHistory]);
  
  const canCheckIn = !todayAttendance;
  const canCheckOut = todayAttendance && !todayAttendance.checkOutTime;
  
  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Track your work hours and attendance</p>
      </div>
      
      {/* Current Time & Status */}
      <Card>
        <div className="attendance-status">
          <div className="current-time">
            <div className="time-display">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </div>
            <div className="date-display">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          <div className="attendance-actions">
            {todayLoading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
                {!todayAttendance && (
                  <Button 
                    variant="primary" 
                    size="large"
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                  >
                    {checkingIn ? 'Checking In...' : 'Check In'}
                  </Button>
                )}
                
                {todayAttendance && !todayAttendance.checkOutTime && (
                  <div className="checked-in-status">
                    <div className="status-badge status-present">
                      ✓ Checked In
                    </div>
                    <div className="check-in-time">
                      at {formatTime(todayAttendance.checkInTime)}
                    </div>
                    <Button 
                      variant="primary" 
                      size="large"
                      onClick={handleCheckOut}
                      disabled={checkingOut}
                    >
                      {checkingOut ? 'Checking Out...' : 'Check Out'}
                    </Button>
                  </div>
                )}
                
                {todayAttendance && todayAttendance.checkOutTime && (
                  <div className="checked-out-status">
                    <div className="status-badge status-completed">
                      ✓ Completed
                    </div>
                    <div className="time-summary">
                      <div>Check-in: {formatTime(todayAttendance.checkInTime)}</div>
                      <div>Check-out: {formatTime(todayAttendance.checkOutTime)}</div>
                      <div className="total-hours">
                        Total: {todayAttendance.totalHours?.toFixed(2) || 0} hours
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
      
      {/* Statistics */}
      <div className="attendance-stats">
        <div className="stat-card">
          <div className="stat-label">Total Days</div>
          <div className="stat-value">{stats.totalDays}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">On Time</div>
          <div className="stat-value stat-success">{stats.presentDays}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Late</div>
          <div className="stat-value stat-warning">{stats.lateDays}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Hours</div>
          <div className="stat-value">{stats.totalHours.toFixed(1)}h</div>
        </div>
      </div>
      
      {/* Attendance History */}
      <Card title="Attendance History">
        <div className="filter-section">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            label="Date Range"
          />
        </div>
        
        {historyLoading ? (
          <div className="loading-container">
            <div className="loading"></div>
            <p>Loading attendance history...</p>
          </div>
        ) : !attendanceHistory || attendanceHistory.length === 0 ? (
          <div className="empty-state">
            <p>No attendance records found for the selected period</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.checkInTime)}</td>
                    <td>{formatTime(record.checkInTime)}</td>
                    <td>{record.checkOutTime ? formatTime(record.checkOutTime) : '-'}</td>
                    <td>{record.totalHours ? `${record.totalHours.toFixed(2)}h` : '-'}</td>
                    <td>
                      <span className={`status-badge status-${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};

export default AttendancePage;
