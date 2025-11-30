import React from 'react';

export const Input = ({ 
  type = 'text', 
  placeholder, 
  className = '', 
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`flex-1 px-4 py-3 bg-transparent text-white placeholder-slate-500 outline-none ${className}`}
      {...props}
    />
  );
};

export default Input;