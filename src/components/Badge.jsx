import React from 'react';

const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-50 text-[#F46B03]',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  dark: 'bg-gray-800 text-white',
};

const Badge = ({ children, variant = 'default', className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
