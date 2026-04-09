import React from 'react';

const Button = ({
  children,
  variant = 'solid',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    solid: 'bg-[#F46B03] hover:bg-[#C15300] text-white focus:ring-[#F46B03]',
    outline: 'border-2 border-[#F46B03] text-[#F46B03] hover:bg-[#F46B03] hover:text-white bg-transparent focus:ring-[#F46B03]',
    ghost: 'text-[#F46B03] hover:bg-[#F46B03]/10 bg-transparent focus:ring-[#F46B03]',
    secondary: 'bg-[#1C25F2] hover:bg-[#1219C0] text-white focus:ring-[#1C25F2]',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600',
    dark: 'bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-700',
    white: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 focus:ring-gray-300',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.solid} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
