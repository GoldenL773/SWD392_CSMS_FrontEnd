import React from 'react';
import PropTypes from 'prop-types';
import './Input.css';

/**
 * Input Component
 * Base input component with label, error message, and support for start/end icons
 */
const Input = React.forwardRef(({
  label,
  error,
  startIcon,
  endIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className={`input-container ${error ? 'has-error' : ''}`}>
        {startIcon && <span className="input-icon start-icon">{startIcon}</span>}
        <input
          id={inputId}
          ref={ref}
          className={`input-field ${startIcon ? 'has-start-icon' : ''} ${endIcon ? 'has-end-icon' : ''}`}
          {...props}
        />
        {endIcon && <span className="input-icon end-icon">{endIcon}</span>}
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  type: PropTypes.string
};

Input.defaultProps = {
  type: 'text'
};

export default Input;
