import React from 'react';
import CancelButton from '../buttons/cancelButton';
import SubmitButton from '../buttons/submitButton';

const FormActions = ({ 
  onCancel,
  cancelText = "Cancel",
  submitText = "Submit",
  submitDisabled = false,
  className = "",
  ...props
}) => {
  return (
    <div className={`form-actions ${className}`} {...props}>
      <CancelButton 
        onClick={onCancel}
        text={cancelText}
      />
      <SubmitButton 
        text={submitText}
        disabled={submitDisabled}
      />
    </div>
  );
};

export default FormActions;