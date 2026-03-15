import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal/index.jsx';
import Button from '../common/Button/index.jsx';
import { getSalaryHistory } from '../../api/salaryApi.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.jsx';

const SalaryHistoryModal = ({ open, onClose, salary }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!open || !salary) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getSalaryHistory(salary.id);
        if (mounted) setItems(res || []);
      } catch (e) {
        setError(e?.message || 'Failed to load history');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [open, salary]);

  return (
    <Modal isOpen={open} onClose={onClose} title={`Salary Update History for ${salary?.employeeName} - ${salary ? `${salary.month}/${salary.year}` : ''}`} size="large">
      {loading ? (
        <div className="loading-container" style={{ padding: 16 }}>
          <div className="loading" />
          <p>Loading history...</p>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ padding: 16 }}>
          <p>{error}</p>
        </div>
      ) : !items || items.length === 0 ? (
        <div className="empty-state" style={{ padding: 16 }}>
          <p>No history records.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="salary-table">
            <thead>
              <tr>
                <th>Change Date</th>
                <th>Changed By</th>
                <th>Reason</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{formatDate(it.changeDate)}</td>
                  <td>{it.changedByName || '-'}</td>
                  <td>{it.note || '-'}</td>
                  <td style={{ whiteSpace: 'pre-line' }}>
                    {`Bonus: ${formatCurrency(it.oldBonus || 0)} → ${formatCurrency(it.newBonus || 0)}\n`}
                    {`Deduction: ${formatCurrency(it.oldDeduction || 0)} → ${formatCurrency(it.newDeduction || 0)}\n`}
                    {`Total Salary: ${formatCurrency(it.oldTotalSalary || 0)} → ${formatCurrency(it.newTotalSalary || 0)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="modal-footer">
        <Button variant="primary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default SalaryHistoryModal;
