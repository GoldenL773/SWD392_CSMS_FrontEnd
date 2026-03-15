import React, { useState, useRef } from 'react';
import { UploadSimple, File, X, Check, Warning } from '@phosphor-icons/react';
import './ReportUpload.css';

/**
 * ReportUpload Component
 * Allows accountants to upload report files with metadata
 * Supports drag-and-drop and file selection
 */
const ReportUpload = ({ 
  onUpload, 
  acceptedFormats = ['.pdf', '.xlsx', '.xls', '.csv'],
  maxFileSize = 10 * 1024 * 1024 // 10MB default
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Metadata form state
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    reportType: 'Financial',
    reportPeriod: ''
  });

  const [metadataErrors, setMetadataErrors] = useState({});

  const reportTypes = ['Financial', 'Inventory', 'Sales', 'Other'];

  const validateFile = (file) => {
    setError('');

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      setError(`Invalid file type. Please upload ${acceptedFormats.join(', ')} files only.`);
      return false;
    }

    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
      setError(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setSuccess(false);
      // Auto-fill title if empty
      if (!metadata.title) {
        setMetadata(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '') // Remove extension
        }));
      }
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateMetadata = () => {
    const errors = {};

    if (!metadata.title.trim()) {
      errors.title = 'Report title is required';
    }

    if (!metadata.reportPeriod.trim()) {
      errors.reportPeriod = 'Report period is required';
    }

    setMetadataErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!validateMetadata()) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call the upload handler
      await onUpload(selectedFile, metadata);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      setUploading(false);

      // Reset form after successful upload
      setTimeout(() => {
        handleClearFile();
        setMetadata({
          title: '',
          description: '',
          reportType: 'Financial',
          reportPeriod: ''
        });
        setSuccess(false);
        setUploadProgress(0);
      }, 2000);

    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="report-upload">
      <div className="upload-header">
        <UploadSimple size={32} weight="thin" />
        <div>
          <h3>Upload Report</h3>
          <p>Upload financial reports, inventory reports, or sales reports</p>
        </div>
      </div>

      {/* File Upload Area */}
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''} ${error ? 'error' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {!selectedFile ? (
          <>
            <UploadSimple size={48} weight="thin" className="upload-icon" />
            <p className="upload-text">
              Drag and drop file here or <span className="browse-link">click to browse</span>
            </p>
            <p className="upload-hint">
              Supported formats: {acceptedFormats.join(', ')} (Max {(maxFileSize / (1024 * 1024)).toFixed(0)}MB)
            </p>
          </>
        ) : (
          <div className="file-preview" onClick={(e) => e.stopPropagation()}>
            <File size={48} weight="thin" className="file-icon" />
            <div className="file-info">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button 
              className="btn-remove" 
              onClick={handleClearFile}
              disabled={uploading}
              title="Remove file"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="message error-message">
          <Warning size={20} weight="fill" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="message success-message">
          <Check size={20} weight="bold" />
          <span>Report uploaded successfully!</span>
        </div>
      )}

      {/* Metadata Form */}
      {selectedFile && !success && (
        <div className="metadata-form">
          <h4>Report Information</h4>

          <div className="form-group">
            <label htmlFor="report-title">
              Report Title <span className="required">*</span>
            </label>
            <input
              id="report-title"
              type="text"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              className={metadataErrors.title ? 'error' : ''}
              placeholder="e.g., Monthly Financial Report - January 2024"
              disabled={uploading}
            />
            {metadataErrors.title && (
              <span className="error-text">{metadataErrors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="report-description">Description</label>
            <textarea
              id="report-description"
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              placeholder="Add any additional notes or description..."
              rows={3}
              disabled={uploading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="report-type">
                Report Type <span className="required">*</span>
              </label>
              <select
                id="report-type"
                value={metadata.reportType}
                onChange={(e) => setMetadata({ ...metadata, reportType: e.target.value })}
                disabled={uploading}
              >
                {reportTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="report-period">
                Report Period <span className="required">*</span>
              </label>
              <input
                id="report-period"
                type="date"
                value={metadata.reportPeriod}
                onChange={(e) => setMetadata({ ...metadata, reportPeriod: e.target.value })}
                className={metadataErrors.reportPeriod ? 'error' : ''}
                disabled={uploading}
              />
              {metadataErrors.reportPeriod && (
                <span className="error-text">{metadataErrors.reportPeriod}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-info">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !success && (
        <div className="upload-actions">
          <button 
            className="btn-secondary" 
            onClick={handleClearFile}
            disabled={uploading}
          >
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
          >
            {uploading ? 'Uploading...' : 'Upload Report'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportUpload;
