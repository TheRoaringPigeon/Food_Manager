import React from 'react';
import Button from './button';

const TabButton = ({ 
  children,
  onClick,
  isActive = false,
  disabled = false,
  ...props
}) => {
  const activeClass = isActive ? "active" : "";
  
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="tab"
      className={activeClass}
      {...props}
    >
      {children}
    </Button>
  );
};

export default TabButton;