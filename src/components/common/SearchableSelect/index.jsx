import React, { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import './SearchableSelect.css';

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select an option...',
  clearLabel = '-- Select / Clear --',
  clearValue = 'ALL',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  // Find selected option
  const selectedOption = useMemo(() => {
    return options.find(opt => String(opt?.value) === String(value)) || null;
  }, [options, value]);

  // Filter options
  const filteredOptions = options.filter(opt => 
    opt && opt.label && opt.label.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      const clickedOutsideWrapper = wrapperRef.current && !wrapperRef.current.contains(event.target);
      const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
      if (clickedOutsideWrapper && clickedOutsideDropdown) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !wrapperRef.current) return;

    const updateDropdownPosition = () => {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`searchable-select-wrapper ${className}`} ref={wrapperRef}>
      <div 
        className={`searchable-select-header ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="dropdown-arrow">▼</span>
      </div>

      {isOpen && createPortal(
        <div
          className="searchable-select-dropdown searchable-select-dropdown-portal"
          ref={dropdownRef}
          style={dropdownStyle}
        >
          <input
            type="text"
            className="searchable-select-search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <ul className="searchable-select-options">
            <li 
               className={`searchable-select-option ${String(value) === String(clearValue) ? 'selected' : ''}`}
               onClick={() => handleSelect(clearValue)}
            >
               {clearLabel}
            </li>
            {filteredOptions.length === 0 ? (
              <li className="searchable-select-no-results">No results found</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  className={`searchable-select-option ${String(value) === String(opt.value) ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
};

SearchableSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired
  })).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  clearLabel: PropTypes.string,
  clearValue: PropTypes.any,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default SearchableSelect;
