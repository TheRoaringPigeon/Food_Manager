import { useState } from 'react';
import './form.css';
import FormActions from './formActions';

const Form = ({ 
  title, 
  fields, 
  onSubmit, 
  onCancel, 
  submitText = "Submit", 
  cancelText = "Cancel",
  formData,
  setFormData,
  errors = {},
  validate
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Call validation if provided
    if (validate && typeof validate === 'function') {
      validate(name, value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field) => {
    const { 
      name, 
      label, 
      type = 'text', 
      placeholder, 
      required = false, 
      options = [], 
      rows = 3,
      min,
      step,
      onBlur
    } = field;

    const hasError = errors[name];
    const labelClass = hasError ? "nameLabel-error" : "nameLabel-normal";

    switch (type) {
      case 'select':
        return (
          <div className="form-group" key={name}>
            <label htmlFor={name} className={labelClass}>
              {label} {required && '*'}
            </label>
            <select
              id={name}
              name={name}
              value={formData[name] || ''}
              onChange={handleInputChange}
              required={required}
              style={{
                borderColor: hasError ? '#e70966' : '#dee2e6'
              }}
            >
              <option value="">Select {label.toLowerCase()}</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && (
              <small style={{ color: '#e70966' }}>
                {errors[name]}
              </small>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="form-group" key={name}>
            <label htmlFor={name} className={labelClass}>
              {label} {required && '*'}
            </label>
            <textarea
              id={name}
              name={name}
              value={formData[name] || ''}
              onChange={handleInputChange}
              placeholder={placeholder}
              required={required}
              rows={rows}
              style={{
                padding: '0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                borderColor: hasError ? '#e70966' : '#dee2e6'
              }}
            />
            {hasError && (
              <small style={{ color: '#e70966' }}>
                {errors[name]}
              </small>
            )}
          </div>
        );

      default:
        return (
          <div className="form-group" key={name}>
            <label htmlFor={name} className={labelClass}>
              {label} {required && '*'}
            </label>
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name] || ''}
              onChange={handleInputChange}
              onBlur={onBlur}
              placeholder={placeholder}
              required={required}
              min={min}
              step={step}
              style={{
                borderColor: hasError ? '#e70966' : '#dee2e6'
              }}
            />
            {hasError && (
              <small style={{ color: '#e70966' }}>
                {errors[name]}
              </small>
            )}
          </div>
        );
    }
  };

  const renderFormRows = () => {
    const rows = [];
    let currentRow = [];

    fields.forEach((field, index) => {
      currentRow.push(field);

      // Create a row when we have 2 fields or it's the last field
      if (currentRow.length === 2 || index === fields.length - 1) {
        if (currentRow.length === 2) {
          rows.push(
            <div className="form-row" key={`row-${rows.length}`}>
              {currentRow.map(renderField)}
            </div>
          );
        } else {
          // Single field, render without form-row
          rows.push(...currentRow.map(renderField));
        }
        currentRow = [];
      }
    });

    return rows;
  };

  return (
    <div className="create-form-overlay" onClick={onCancel}>
      <div className="create-form-container" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <form onSubmit={handleSubmit} className="create-ingredient-form">
          {renderFormRows()}
          
          <FormActions
            onCancel={onCancel}
            cancelText={cancelText}
            submitText={submitText}
          />
        </form>
      </div>
    </div>
  );
};

export default Form;