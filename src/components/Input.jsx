import React, { useState } from 'react';

const Input = ({ 
  label, 
  icon, 
  value: propValue,
  onChange: propOnChange,
  required = false,
  ...props 
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  // Support both controlled and uncontrolled usage
  const isControlled = propValue !== undefined;
  const value = isControlled ? propValue : internalValue;

  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    if (propOnChange) {
      propOnChange(e);
    }
  };

  const isActive = isFocused || (value && value.toString().length > 0);
  const showRequired = required && touched && (!value || value.toString().length === 0);

  // Determine border color based on state
  let borderColor = 'border-gray-300';
  if (showRequired) {
    borderColor = 'border-[#FF0000]';
  } else if (isFocused) {
    borderColor = 'border-[#F46B03]';
  }

  return (
    <div className="relative w-full mt-4 mb-2">
      <div className={`flex items-center border rounded w-full h-11 px-3 bg-white transition-colors duration-200 ${borderColor}`}>
        
        {/* Render Icon if passed */}
        {icon && (
          <div className="flex-shrink-0 mr-2 text-gray-500 flex items-center justify-center">
            {icon}
          </div>
        )}

        <input
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => { setIsFocused(false); setTouched(true); }}
          className="w-full h-full outline-none bg-transparent text-sm text-gray-800"
          {...props}
        />
      </div>

      {/* Floating Label */}
      <label
        className={`absolute transition-all duration-200 pointer-events-none bg-white px-1 leading-none
          ${isActive 
            ? '-top-2 left-2 text-[11px] text-gray-600' 
            : `top-3.5 text-sm text-gray-500 ${icon ? 'left-9' : 'left-3'}`
          }
        `}
      >
        {label}
      </label>
      
      {/* Required field message */}
      {showRequired && (
        <span className="text-[#FF0000] text-xs absolute -bottom-5 left-1">
          This field is required
        </span>
      )}
    </div>
  );
};

export default Input;
