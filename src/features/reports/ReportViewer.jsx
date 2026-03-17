import React, { useState } from 'react';
import { File, FilePdf, FileXls, FileCsv, MagnifyingGlass, Funnel, Download, Eye, X, SortAscending } from '@phosphor-icons/react';
import './ReportViewer.css';

/**
 * ReportViewer Component
 * Displays list of uploaded reports with preview and download functionality
 * Supports search, filter, and sort operations
 */
const ReportViewer = ({ 
  reports = [], 
  onPreview, 
  onDownload 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Date');
  const [previewReport, setPreviewReport] = useState(null);

  const reportTypes = ['All', 'Financial', 'Inventory', 'Sales', 'Other'];
  const sortOptions = ['Date', 'Title', 'Type'];

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return <FilePdf size={48} weight="thin" />;
    } else if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) {
      return <FileXls size={48} weight="thin" />;
    } else if (fileType?.includes('csv')) {
      return <FileCsv size={48} weight="thin" />;
    }
    return <File size={48} weight="thin" />;
  };

  const formatDate = (date) => {
    if (date == null || date === '') return '—';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  const formatFileSize = (bytes) => {
    if (bytes == null || bytes === '' || Number.isNaN(Number(bytes))) return '—';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handlePreview = (report) => {
    setPreviewReport(report);
    if (onPreview) {
      onPreview(report.id);
    }
  };

  const handleDownload = (report) => {
    if (onDownload) {
      onDownload(report.id, report.fileName || report.title);
    }
  };

  const handleClosePreview = () => {
    setPreviewReport(null);
  };

  // Filter and sort reports
  const filteredReports = reports
    .filter(report => {
      const title = (report.title || report.fileName || '').toLowerCase();
      const description = (report.description || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = title.includes(search) || description.includes(search);
      const matchesType = typeFilter === 'All' || report.reportType === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'Date': {
          const tA = new Date(a.uploadedAt).getTime();
          const tB = new Date(b.uploadedAt).getTime();
          return (Number.isNaN(tB) ? 0 : tB) - (Number.isNaN(tA) ? 0 : tA);
        }
        case 'Title':
          return a.title.localeCompare(b.title);
        case 'Type':
          return a.reportType.localeCompare(b.reportType);
        default:
          return 0;
      }
    });

  return (
    <div className="report-viewer">
      <div className="report-viewer-header">
        <div className="header-content">
          <File size={32} weight="thin" />
          <div>
            <h2>Reports</h2>
            <p>View and download uploaded reports</p>
          </div>
        </div>
      </div>

      {/* Search, Filter, and Sort Controls */}
      <div className="report-controls">
        <div className="search-bar">
          <MagnifyingGlass size={20} weight="thin" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Funnel size={20} weight="thin" />
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            {reportTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="sort-group">
          <SortAscending size={20} weight="thin" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            {sortOptions.map(option => (
              <option key={option} value={option}>Sort by {option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="reports-list">
        {filteredReports.length === 0 ? (
          <div className="empty-state">
            <File size={64} weight="thin" />
            <p>No reports found</p>
            {searchTerm || typeFilter !== 'All' ? (
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('All');
                }}
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="reports-grid">
            {filteredReports.map(report => (
              <div key={report.id} className="report-card">
                <div className="report-icon">
                  {getFileIcon(report.fileType)}
                </div>

                <div className="report-info">
                  <h3 className="report-title">{report.title}</h3>
                  
                  <div className="report-meta">
                    <span className={`report-type ${report.reportType.toLowerCase()}`}>
                      {report.reportType}
                    </span>
                    <span className="report-period">{report.reportPeriod}</span>
                  </div>

                  {report.description && (
                    <p className="report-description">{report.description}</p>
                  )}

                  <div className="report-details">
                    <span className="detail-item">
                      <strong>Uploaded by:</strong> {report.uploadedBy}
                    </span>
                    <span className="detail-item">
                      <strong>Date:</strong> {formatDate(report.uploadedAt)}
                    </span>
                    <span className="detail-item">
                      <strong>Size:</strong> {formatFileSize(report.fileSize)}
                    </span>
                  </div>
                </div>

                <div className="report-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => handlePreview(report)}
                    disabled={!report.previewUrl}
                    title={report.previewUrl ? "Preview report" : "Preview not available"}
                  >
                    <Eye size={20} weight="thin" />
                    Preview
                  </button>
                  <button 
                    className="btn-icon btn-primary" 
                    onClick={() => handleDownload(report)}
                    title="Download report"
                  >
                    <Download size={20} weight="thin" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <div className="modal-overlay" onClick={handleClosePreview}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h3>{previewReport.title}</h3>
                <div className="modal-meta">
                  <span className={`report-type ${previewReport.reportType.toLowerCase()}`}>
                    {previewReport.reportType}
                  </span>
                  <span className="report-period">{previewReport.reportPeriod}</span>
                </div>
              </div>
              <button className="btn-close" onClick={handleClosePreview}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <div className="modal-body">
              {previewReport.previewUrl ? (
                <div className="preview-container">
                  {previewReport.fileType?.includes('pdf') ? (
                    <iframe
                      src={previewReport.previewUrl}
                      title={previewReport.title}
                      className="pdf-preview"
                    />
                  ) : (
                    <div className="preview-placeholder">
                      {getFileIcon(previewReport.fileType)}
                      <p>Preview not available for this file type</p>
                      <p className="preview-hint">Click download to view the file</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="preview-placeholder">
                  {getFileIcon(previewReport.fileType)}
                  <p>Preview not available</p>
                  <p className="preview-hint">Click download to view the file</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleClosePreview}>
                Close
              </button>
              <button 
                className="btn-primary" 
                onClick={() => handleDownload(previewReport)}
              >
                <Download size={20} weight="bold" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportViewer;
