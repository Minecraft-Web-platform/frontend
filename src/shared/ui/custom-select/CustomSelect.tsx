import { FC, useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './CustomSelect.scss';

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CustomSelect: FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Выберите...',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select ${isOpen ? 'custom-select--open' : ''} ${
        disabled ? 'custom-select--disabled' : ''
      } ${className}`}
    >
      <button
        type="button"
        className="custom-select__trigger"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="custom-select__trigger-text">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="custom-select__trigger-icon">{selectedOption.icon}</span>
              )}
              {selectedOption.label}
            </>
          ) : (
            <span className="custom-select__placeholder">{placeholder}</span>
          )}
        </span>
        <ChevronDown className="custom-select__chevron" size={16} />
      </button>

      {isOpen && (
        <ul className="custom-select__dropdown" role="listbox">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                className={`custom-select__option ${
                  isSelected ? 'custom-select__option--selected' : ''
                }`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
              >
                <div className="custom-select__option-content">
                  {opt.icon && <span className="custom-select__option-icon">{opt.icon}</span>}
                  <span className="custom-select__option-label">{opt.label}</span>
                </div>
                {isSelected && <Check size={14} className="custom-select__check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
