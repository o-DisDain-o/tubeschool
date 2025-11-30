import React from 'react';

export const Card = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div
      className={`rounded-3xl bg-slate-900/70 border border-slate-800 shadow-tubes ${
        noPadding ? '' : 'p-6'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;