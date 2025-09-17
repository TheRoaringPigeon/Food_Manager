import React from 'react';
import Button from './button';

const AddButton = ({ 
  onClick, 
  text = "Add Item", 
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="add"
      className={className}
      {...props}
    >
      + {text}
    </Button>
  );
};

export default AddButton;