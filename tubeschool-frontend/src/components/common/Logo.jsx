import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Logo = ({ size = 'md', showIcon = true }) => {
  const sizes = {
    sm: { icon: 20, text: 'text-xl' },
    md: { icon: 28, text: 'text-2xl' },
    lg: { icon: 36, text: 'text-4xl' },
    xl: { icon: 48, text: 'text-7xl md:text-8xl' }, // Super large for Hero
  };
  
  return (
    <div className="flex items-center gap-2 select-none">
      {showIcon && (
        <div className="relative">
          <GraduationCap 
            size={sizes[size].icon} 
            className="text-tubes-accent" 
          />
        </div>
      )}
      <div className={`${sizes[size].text} flex items-baseline tracking-tight`}>
        <span className="font-sans font-medium text-white">
          tube
        </span>
        <span className="font-script font-bold text-tubes-accent ml-0.5">
          School
        </span>
      </div>
    </div>
  );
};

export default Logo;