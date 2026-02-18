import React from 'react';

const StaggerItem = ({ children, index, className }) => (
  <div 
    className={`transform ${className || ''}`}
    style={{
      opacity: 0,
      animation: `slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.08 + 0.2}s`
    }}
  >
    {children}
  </div>
);

export default StaggerItem;
