import React from 'react';
import './button.css';

const Button = ({ 
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  size = "medium",
  className = "",
  ...props
}) => {
  const baseClass = "button";
  const variantClass = `button--${variant}`;
  const sizeClass = size !== "medium" ? `button--${size}` : "";
  
  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;