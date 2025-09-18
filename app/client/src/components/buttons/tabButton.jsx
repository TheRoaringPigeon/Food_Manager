import React from 'react';
import Button from './button';

const TabButton = ({ 
  children,
  onClick,
  isActive = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const activeClass = isActive ? "active" : "";
  const combinedClassName = [className, activeClass].filter(Boolean).join(" ");
  
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="tab"
      className={combinedClassName}
      {...props}
    >
      {children}
    </Button>
  );
};

export default TabButton;