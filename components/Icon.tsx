
import React from 'react';
import { ICONS } from '../constants';

interface IconProps {
  name: keyof typeof ICONS;
  size?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 16, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
};

export default Icon;
