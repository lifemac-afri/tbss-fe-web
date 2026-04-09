import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  icon,
  type = 'text',
  value: propValue,
  onChange: propOnChange,
  required = false,
  error,
  helperText,
  className = '',
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isControlled = propValue !== undefined;
  const value = isControlled ? propValue : internalValue;

  const handleChange = (e) => {
    if (!isControlled) setInternalValue(e.target.value);
    propOnChange?.(e);
  };

  const isActive = isFocused || (value && value.toString().length > 0);
  const showRequired = required && touched && (!value || value.toString().length === 0);
  const hasError = error || showRequired;

  const borderClass = hasError
    ? 'border-red-500 focus-within:border-red-500'
    : isFocused
    ? 'border-[#F46B03]'
    : 'border-gray-300';

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`relative w-full mt-4 mb-1 ${className}`}>
      <div className={`flex items-center border rounded-lg w-full h-11 px-3 bg-white transition-colors duration-200 ${borderClass}`}>
        {icon && (
          <span className="mr-2 text-gray-400 flex-shrink-0">{icon}</span>
        )}
        <div className="relative flex-1 h-full">
          {label && (
            <label
              className={`absolute left-0 transition-all duration-200 pointer-events-none select-none
                ${isActive
                  ? 'top-0 text-[10px] text-[#F46B03] font-medium'
                  : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
                }`}
            >
              {label}{required && ' *'}
            </label>
          )}
          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => { setIsFocused(false); setTouched(true); }}
            className={`w-full h-full bg-transparent outline-none text-sm text-gray-800 ${label ? 'pt-3' : ''}`}
            {...props}
          />
        </div>
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hasError && (
        <p className="text-red-500 text-xs mt-1 ml-1">
          {error || (showRequired ? `${label || 'This field'} is required` : '')}
        </p>
      )}
      {helperText && !hasError && (
        <p className="text-gray-400 text-xs mt-1 ml-1">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
