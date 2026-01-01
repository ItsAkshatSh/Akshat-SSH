import React from 'react';

const StaggerItem = ({ children, index, className }) => (
  <div 
    className={`transform transition-all duration-700 ease-out ${className}`}
    style={{
      opacity: 0,
      animation: `slideUpFade 0.6s ease-out forwards ${index * 0.1 + 0.3}s`
    }}
  >
    {children}
  </div>
);

export default StaggerItem;
