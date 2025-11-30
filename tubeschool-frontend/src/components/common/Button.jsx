import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-tubes-accent hover:bg-tubes-accent-soft text-white shadow-lg shadow-accent',
    secondary: 'bg-slate-800/70 hover:bg-slate-700 text-slate-200 border border-slate-700',
    ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-300',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-xl',
    md: 'px-5 py-2.5 text-sm rounded-2xl',
    lg: 'px-6 py-3 text-base rounded-2xl',
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;