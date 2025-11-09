import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../common/Modal/index.jsx';
import { getAllOrders } from '../../api/orderApi.jsx';
import { getEmployeeAttendance } from '../../api/employeeApi.jsx';
import { getEmployeeSalary } from '../../api/employeeApi.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.jsx';

const EmployeeDetailModal = ({ open, onClose, employee, startDate, endDate }) => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [salary, setSalary] = useState(null);
  const month = useMemo(() => (startDate ? new Date(startDate).getMonth() + 1 : undefined), [startDate]);
  const year = useMemo(() => (startDate ? new Date(startDate).getFullYear() : undefined), [startDate]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!open || !employee) return;
      setLoading(true);
      try {
        const [ordersRes, attRes, salRes] = await Promise.all([
          getAllOrders({ employeeId: employee.employeeId, status: 'COMPLETED', startDate, endDate, size: 10000 }),
          getEmployeeAttendance(employee.employeeId, { startDate, endDate, size: 1000 }),
          month && year ? getEmployeeSalary(employee.employeeId, { month, year }) : Promise.resolve([])
        ]);
        if (!active) return;
        const listOrders = ordersRes?.content || ordersRes || [];
        setOrders(Array.isArray(listOrders) ? listOrders : []);
        setAttendance(Array.isArray(attRes) ? attRes : (attRes?.content || []));
        const salaryList = Array.isArray(salRes) ? salRes : (salRes?.content || []);
        setSalary(salaryList && salaryList.length > 0 ? salaryList[0] : null);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [open, employee, startDate, endDate, month, year]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDaysWorked = attendance.filter(a => (a.status || '').toLowerCase() !== 'absent').length;
    const totalHours = attendance.reduce((s, a) => s + (Number(a.workingHours) || 0), 0);
    // Working days in range
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    const days = Math.floor((ed - sd) / (24 * 3600 * 1000)) + 1;
    const attendanceRate = days > 0 ? (totalDaysWorked / days) * 100 : 0;
    return { totalRevenue, totalOrders, aov, totalDaysWorked, totalHours, attendanceRate };
  }, [orders, attendance, startDate, endDate]);

  return (
    <Modal isOpen={open} onClose={onClose} title={`Employee Details - ${employee?.employeeName || ''}`} size="large">
      {loading ? (
        <div className="loading-container"><div className="loading" /><p>Loading...</p></div>
      ) : (
        <div className="employee-detail">
          <div style={{ marginBottom: 12 }}>
            <strong>Period:</strong> {startDate} → {endDate}
          </div>

          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            <div className="stat-card"><div className="stat-label">Total Orders</div><div className="stat-value">{stats.totalOrders}</div></div>
            <div className="stat-card"><div className="stat-label">Total Revenue</div><div className="stat-value">{formatCurrency(stats.totalRevenue)}</div></div>
            <div className="stat-card"><div className="stat-label">Average Order Value</div><div className="stat-value">{formatCurrency(stats.aov)}</div></div>
            <div className="stat-card"><div className="stat-label">Days Worked</div><div className="stat-value">{stats.totalDaysWorked}</div></div>
            <div className="stat-card"><div className="stat-label">Hours Worked</div><div className="stat-value">{stats.totalHours.toFixed(2)}</div></div>
            <div className="stat-card"><div className="stat-label">Attendance Rate</div><div className="stat-value">{stats.attendanceRate.toFixed(1)}%</div></div>
            {salary && (
              <>
                <div className="stat-card"><div className="stat-label">Base Salary</div><div className="stat-value">{formatCurrency(salary.baseSalary)}</div></div>
                <div className="stat-card"><div className="stat-label">Bonus</div><div className="stat-value">{formatCurrency(salary.bonus || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Deductions</div><div className="stat-value">{formatCurrency(salary.deductions || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Total Salary</div><div className="stat-value">{formatCurrency(salary.totalSalary)}</div></div>
              </>
            )}
          </div>

          <h3 style={{ marginTop: 16 }}>Orders</h3>
          {orders.length === 0 ? (
            <div className="empty-state">No orders in this period.</div>
          ) : (
            <div className="table-container">
              <table className="salary-table">
                <thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}><td>{formatDate(o.orderDate)}</td><td>{formatCurrency(o.totalAmount)}</td><td>{o.status}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 style={{ marginTop: 16 }}>Attendance</h3>
          {attendance.length === 0 ? (
            <div className="empty-state">No attendance records in this period.</div>
          ) : (
            <div className="table-container">
              <table className="salary-table">
                <thead><tr><th>Date</th><th>Check-in</th><th>Check-out</th><th>Hours</th><th>Status</th></tr></thead>
                <tbody>
                  {attendance.map(a => (
                    <tr key={a.id}><td>{a.date}</td><td>{a.checkInTime || '-'}</td><td>{a.checkOutTime || '-'}</td><td>{(Number(a.workingHours)||0).toFixed(2)}</td><td>{a.status}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default EmployeeDetailModal;
