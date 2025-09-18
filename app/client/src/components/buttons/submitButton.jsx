import React from 'react';
import Button from './button';

const SubmitButton = ({ 
  text = "Submit", 
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <Button
      type="submit"
      disabled={disabled}
      variant="submit"
      className={className}
      {...props}
    >
      {text}
    </Button>
  );
};

export default SubmitButton;