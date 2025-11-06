import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/common/Button/index.jsx';
import { formatCurrency, formatDate, safeNumber } from '../../utils/formatters.jsx';
import './DailyReportExport.css';

/**
 * DailyReportExport Component
 * View and export daily reports
 * Entity: DailyReport (reportDate, totalOrders, totalRevenue, totalIngredientCost, totalWorkingHours, notes)
 */
const DailyReportExport = ({ report }) => {
  const [notes, setNotes] = useState(report?.notes || '');

  const exportToCSV = () => {
    if (!report) return;

    const csvData = [
      ['Daily Report', formatDate(report.reportDate)],
      [''],
      ['Metric', 'Value'],
      ['Total Orders', report.totalOrders],
      ['Total Revenue', report.totalRevenue],
      ['Total Ingredient Cost', report.totalIngredientCost],
      ['Total Working Hours', report.totalWorkingHours],
      ['Net Profit', report.totalRevenue - report.totalIngredientCost],
      [''],
      ['Notes'],
      [notes || 'No notes']
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `daily-report-${report.reportDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="report-empty">
        <p>No report data available</p>
      </div>
    );
  }

  const revenue = safeNumber(report.totalRevenue);
  const cost = safeNumber(report.totalIngredientCost);
  const netProfit = revenue - cost;
  const profitMargin = revenue > 0 
    ? ((netProfit / revenue) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="daily-report-export">
      <div className="report-header">
        <div>
          <h2>Daily Report</h2>
          <p className="report-date">{formatDate(report.reportDate)}</p>
        </div>
        <div className="report-actions">
          <Button variant="secondary" onClick={printReport}>
            🖨️ Print
          </Button>
          <Button variant="primary" onClick={exportToCSV}>
            📥 Export CSV
          </Button>
        </div>
      </div>

      <div className="report-content">
        {/* Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <label>Total Orders</label>
            <span className="metric-value">{report.totalOrders}</span>
          </div>
          <div className="metric-card">
            <label>Total Revenue</label>
            <span className="metric-value revenue">{formatCurrency(report.totalRevenue)}</span>
          </div>
          <div className="metric-card">
            <label>Ingredient Cost</label>
            <span className="metric-value cost">{formatCurrency(report.totalIngredientCost)}</span>
          </div>
          <div className="metric-card">
            <label>Working Hours</label>
            <span className="metric-value">{report.totalWorkingHours} hrs</span>
          </div>
          <div className="metric-card highlight">
            <label>Net Profit</label>
            <span className={`metric-value ${netProfit >= 0 ? 'profit' : 'loss'}`}>
              {formatCurrency(netProfit)}
            </span>
          </div>
          <div className="metric-card highlight">
            <label>Profit Margin</label>
            <span className={`metric-value ${netProfit >= 0 ? 'profit' : 'loss'}`}>
              {profitMargin}%
            </span>
          </div>
        </div>

        {/* Notes Section */}
        <div className="notes-section">
          <label htmlFor="report-notes">Notes & Comments</label>
          <textarea
            id="report-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this day's operations..."
            rows="6"
            className="notes-textarea"
          />
          <p className="notes-hint">These notes will be included in the exported report</p>
        </div>

        {/* Summary Table */}
        <div className="summary-table">
          <h3>Financial Summary</h3>
          <table>
            <tbody>
              <tr>
                <td>Total Revenue</td>
                <td className="amount">{formatCurrency(report.totalRevenue)}</td>
              </tr>
              <tr>
                <td>Total Ingredient Cost</td>
                <td className="amount cost">-{formatCurrency(report.totalIngredientCost)}</td>
              </tr>
              <tr className="total-row">
                <td><strong>Net Profit</strong></td>
                <td className={`amount ${netProfit >= 0 ? 'profit' : 'loss'}`}>
                  <strong>{formatCurrency(netProfit)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

DailyReportExport.propTypes = {
  report: PropTypes.shape({
    reportDate: PropTypes.string.isRequired,
    totalOrders: PropTypes.number,
    totalRevenue: PropTypes.number,
    totalIngredientCost: PropTypes.number,
    totalWorkingHours: PropTypes.number,
    notes: PropTypes.string
  })
};

export default DailyReportExport;
