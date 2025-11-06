import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal/index.jsx';
import Button from '../Button/index.jsx';
import './ConfirmDialog.css';

/**
 * ConfirmDialog Component
 * Reusable confirmation dialog for destructive actions
 */
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant }) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      size="small"
    >
      <div className="confirm-dialog">
        <div className={`confirm-message ${variant}`}>
          {variant === 'danger' && (
            <div className="warning-icon">⚠️</div>
          )}
          <p>{message || 'Are you sure you want to proceed?'}</p>
        </div>

        <div className="confirm-actions">
          <Button variant="secondary" onClick={onClose}>
            {cancelText || 'Cancel'}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={handleConfirm}
          >
            {confirmText || 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'danger'])
};

ConfirmDialog.defaultProps = {
  variant: 'default'
};

export default ConfirmDialog;
