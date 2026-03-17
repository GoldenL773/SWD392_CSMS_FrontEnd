import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './SearchableSelect.css';

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select an option...',
  clearLabel = '-- Select / Clear --',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Find selected option
  const selectedOption = options.find(opt => opt.value === value) || null;

  // Filter options
  const filteredOptions = options.filter(opt => 
    opt && opt.label && opt.label.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      {isOpen && (
        <div className="searchable-select-dropdown">
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
               className={`searchable-select-option ${value === '' || value === 'ALL' ? 'selected' : ''}`}
               onClick={() => handleSelect('ALL')}
            >
               {clearLabel}
            </li>
            {filteredOptions.length === 0 ? (
              <li className="searchable-select-no-results">No results found</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  className={`searchable-select-option ${value === opt.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
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
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default SearchableSelect;
