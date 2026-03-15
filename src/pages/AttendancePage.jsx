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
import { CalendarCheck } from '@phosphor-icons/react';
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
  // Optimistic: hiển thị ngay sau check-in/check-out từ response API, không đợi refetch
  const [optimisticToday, setOptimisticToday] = useState(null);

  // Sorting & Pagination
  const [sortField, setSortField] = useState('checkInTime');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  
  // Update current time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Use employeeId from user profile (not userId)
  const employeeId = user?.employeeId;

  // Normalize attendance record: backend uses checkIn/checkOut, no totalHours
  const normalizeRecord = useCallback((r) => {
    if (!r) return r;
    const checkInTime = r.checkIn ?? r.checkInTime;
    const checkOutTime = r.checkOut ?? r.checkOutTime;
    let totalHours = r.totalHours;
    if (totalHours == null && checkInTime && checkOutTime) {
      const ms = new Date(checkOutTime) - new Date(checkInTime);
      totalHours = Math.max(0, ms / (1000 * 60 * 60));
    }
    return { ...r, checkInTime, checkOutTime, totalHours };
  }, []);

  // Fetch today's attendance
  const { data: todayAttendanceRaw, loading: todayLoading, refetch: refetchToday } = useApiQuery(
    getTodayAttendance,
    employeeId,
    [employeeId],
    { enabled: !!employeeId }
  );
  const todayAttendance = useMemo(
    () => normalizeRecord(todayAttendanceRaw),
    [todayAttendanceRaw, normalizeRecord]
  );
  // Ưu tiên dữ liệu từ server; nếu vừa check-in/check-out thì dùng optimistic để UI cập nhật ngay
  const displayToday = todayAttendance ?? optimisticToday;

  // Fetch attendance history
  const { data: attendanceHistoryRaw, loading: historyLoading, refetch: refetchHistory } = useApiQuery(
    () => getEmployeeAttendanceByDateRange(employeeId, startDate, endDate),
    {},
    [employeeId, startDate, endDate],
    { enabled: !!employeeId }
  );
  const attendanceHistory = useMemo(
    () => (Array.isArray(attendanceHistoryRaw) ? attendanceHistoryRaw.map(normalizeRecord) : []),
    [attendanceHistoryRaw, normalizeRecord]
  );
  
  // Check-in mutation
  const { mutate: performCheckIn, loading: checkingIn } = useApiMutation(checkIn);
  
  // Check-out mutation
  const { mutate: performCheckOut, loading: checkingOut } = useApiMutation(checkOut);
  
  // Ngày local (yyyy-MM-dd) để gửi lên server, tránh lưu sai ngày do timezone server
  const getLocalDateStr = useCallback(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Handle check-in: cập nhật UI ngay từ response, sau đó refetch
  const handleCheckIn = useCallback(async () => {
    if (!employeeId) {
      toast.error('Employee profile not found. Please log in again.');
      return;
    }
    try {
      const result = await performCheckIn(employeeId, getLocalDateStr());
      setOptimisticToday(normalizeRecord(result));
      toast.success('Checked in successfully!');
      refetchToday();
      refetchHistory();
    } catch (error) {
      toast.error(error.message || 'Failed to check in');
    }
  }, [employeeId, performCheckIn, toast, refetchToday, refetchHistory, normalizeRecord, getLocalDateStr]);

  // Handle check-out: cập nhật UI ngay từ response
  const handleCheckOut = useCallback(async () => {
    if (!employeeId) {
      toast.error('Employee profile not found. Please log in again.');
      return;
    }
    try {
      const result = await performCheckOut(employeeId, getLocalDateStr());
      setOptimisticToday(normalizeRecord(result));
      toast.success('Checked out successfully!');
      refetchToday();
      refetchHistory();
    } catch (error) {
      toast.error(error.message || 'Failed to check out');
    }
  }, [employeeId, performCheckOut, toast, refetchToday, refetchHistory, normalizeRecord, getLocalDateStr]);
  
  // Calculate attendance stats (backend uses EARLY, LATE, PRESENT, ABSENT)
  const stats = useMemo(() => {
    if (!attendanceHistory || attendanceHistory.length === 0) {
      return { totalDays: 0, presentDays: 0, lateDays: 0, totalHours: 0 };
    }
    const totalDays = attendanceHistory.length;
    const statusLower = (a) => (a.status || '').toLowerCase();
    const presentDays = attendanceHistory.filter(a =>
      ['present', 'early'].includes(statusLower(a))
    ).length;
    const lateDays = attendanceHistory.filter(a => statusLower(a) === 'late').length;
    const totalHours = attendanceHistory.reduce((sum, a) => sum + (a.totalHours || 0), 0);
    return { totalDays, presentDays, lateDays, totalHours };
  }, [attendanceHistory]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDirection('ASC');
    }
    setPage(0);
  };

  const sortedHistory = useMemo(() => {
    if (!attendanceHistory) return [];
    return [...attendanceHistory].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Special handling for nested or null values
      if (sortField === 'checkInTime' || sortField === 'checkOutTime') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      
      if (aVal < bVal) return sortDirection === 'ASC' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'ASC' ? 1 : -1;
      return 0;
    });
  }, [attendanceHistory, sortField, sortDirection]);

  const paginatedHistory = useMemo(() => {
    const start = page * pageSize;
    return sortedHistory.slice(start, start + pageSize);
  }, [sortedHistory, page]);

  const totalPages = Math.ceil(sortedHistory.length / pageSize);

  // Xóa optimistic khi refetch đã có dữ liệu server
  React.useEffect(() => {
    if (todayAttendance) setOptimisticToday(null);
  }, [todayAttendance]);

  const canCheckIn = !displayToday;
  const canCheckOut = displayToday && !displayToday.checkOutTime;
  
  return (
    <div className="attendance-page">
      <div className="page-header">
        <div className="page-header-content">
          <CalendarCheck size={32} weight="thin" className="page-header-icon" />
          <div>
            <h1 className="page-title">Attendance</h1>
            <p className="page-subtitle">Track your work hours and attendance</p>
          </div>
        </div>
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
                {!displayToday && (
                  <Button 
                    variant="primary" 
                    size="large"
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                  >
                    {checkingIn ? 'Checking In...' : 'Check In'}
                  </Button>
                )}

                {displayToday && !displayToday.checkOutTime && (
                  <div className="checked-in-status">
                    <div className="status-badge status-present">
                      ✓ Checked In
                    </div>
                    <div className="check-in-time">
                      at {displayToday.checkInTime ? formatTime(displayToday.checkInTime) : '—'}
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

                {displayToday && displayToday.checkOutTime && (
                  <div className="checked-out-status">
                    <div className="status-badge status-completed">
                      ✓ Completed
                    </div>
                    <div className="time-summary">
                      <div>Check-in: {displayToday.checkInTime ? formatTime(displayToday.checkInTime) : '—'}</div>
                      <div>Check-out: {formatTime(displayToday.checkOutTime)}</div>
                      <div className="total-hours">
                        Total: {displayToday.totalHours?.toFixed(2) ?? 0} hours
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
            onChange={(start, end) => {
              setStartDate(start ? new Date(start).toISOString().split('T')[0] : '');
              setEndDate(end ? new Date(end).toISOString().split('T')[0] : '');
            }}
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
                  <th onClick={() => handleSort('checkInTime')} className="sortable">
                    Date {sortField === 'checkInTime' && (sortDirection === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('checkInTime')} className="sortable">
                    Check In {sortField === 'checkInTime' && (sortDirection === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('checkOutTime')} className="sortable">
                    Check Out {sortField === 'checkOutTime' && (sortDirection === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('totalHours')} className="sortable">
                    Hours {sortField === 'totalHours' && (sortDirection === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('status')} className="sortable">
                    Status {sortField === 'status' && (sortDirection === 'ASC' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.date ?? record.checkInTime)}</td>
                    <td>{record.checkInTime ? formatTime(record.checkInTime) : '—'}</td>
                    <td>{record.checkOutTime ? formatTime(record.checkOutTime) : '-'}</td>
                    <td>{record.totalHours ? `${record.totalHours.toFixed(2)}h` : '-'}</td>
                    <td>
                      <span className={`status-badge status-${record.status?.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button type="button" className="pagination-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                Trước
              </button>
              <span className="pagination-info">Trang {page + 1} / {totalPages || 1}</span>
              <button type="button" className="pagination-btn" disabled={page >= (totalPages || 1) - 1} onClick={() => setPage(p => p + 1)}>
                Sau
              </button>
            </div>
          </div>
        )}
      </Card>
      
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};

export default AttendancePage;
