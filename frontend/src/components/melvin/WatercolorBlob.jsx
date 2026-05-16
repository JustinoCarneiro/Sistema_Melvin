import React from 'react';
import { cn } from '../../services/utils';

const WatercolorBlob = ({ 
  color = 'blue', 
  className = '', 
  size = 'w-64 h-64',
  opacity = 'opacity-30',
  animate = true
}) => {
  const colors = {
    red: 'bg-melvin-red',
    blue: 'bg-melvin-blue',
    green: 'bg-melvin-green',
    yellow: 'bg-melvin-yellow',
  };

  return (
    <div className={cn(
      "absolute pointer-events-none mix-blend-multiply z-0",
      size,
      opacity,
      animate && "animate-float",
      className
    )}>
      <div 
        className={cn(
          "w-full h-full filter blur-md",
          colors[color] || colors.blue
        )}
        style={{
          borderRadius: '60% 40% 55% 45%',
          filter: 'url(#watercolor-filter) blur(8px)',
        }}
      />
    </div>
  );
};

export default WatercolorBlob;
