import React from 'react';

const Button = ({ 
  children, 
  variant = 'solid', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-2 rounded-md font-semibold transition-colors duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    // Normal #F46B03, Hover #C15300, Text #FFFFFF
    solid: "bg-[#F46B03] hover:bg-[#C15300] text-[#FFFFFF]",
    // Outline based on the secondary images showing matching buttons with outline
    outline: "border-2 border-[#F46B03] text-[#F46B03] hover:bg-[#F46B03] hover:text-[#FFFFFF] bg-transparent",
    // Ghost variant
    ghost: "text-[#F46B03] hover:bg-[#F46B03]/10 bg-transparent",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant] || variants.solid} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
