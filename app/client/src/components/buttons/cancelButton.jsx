import React from 'react';
import Button from './button';

const CancelButton = ({ 
  onClick, 
  text = "Cancel", 
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="cancel"
      className={className}
      {...props}
    >
      {text}
    </Button>
  );
};

export default CancelButton;