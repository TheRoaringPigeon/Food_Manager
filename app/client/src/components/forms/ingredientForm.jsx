import { useState } from 'react';
import Form from './form';
import { createIngredient, searchIngredients } from '../../api/ingredient';
import { CATEGORIES, UNITS, LOCATIONS } from '../../constants/ingredientConstants';

const IngredientForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    expiryDate: "",
    location: "",
  });
  
  const [errors, setErrors] = useState({});

  const validateName = async (name, value) => {
    if (name !== 'name') return;
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, name: "Name is required" }));
      return;
    }

    try {
      const response = await searchIngredients(value);
      if (response.success) {
        const existingIngredient = response.results.find(
          ingredient => ingredient.name.toLowerCase() === value.toLowerCase()
        );
        
        if (existingIngredient) {
          setErrors(prev => ({ 
            ...prev, 
            name: `${value} is already used.` 
          }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.name;
            return newErrors;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setErrors(prev => ({ 
        ...prev, 
        name: "Error checking name in DB" 
      }));
    }
  };

  const handleSubmit = async (data) => {
    // Basic validation
    if (errors.name) {
      alert(
        "The name desired was already taken. Please either enter a new name or update the existing Ingredient."
      );
      return;
    }

    try {
      const response = await createIngredient(data);
      onSubmit({ ...data, id: response.results.id });
    } catch (err) {
      console.error("Failed to create ingredient: ", err);
      alert("Failed to create ingredient. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      category: "",
      quantity: "",
      unit: "",
      expiryDate: "",
      location: "",
    });
    setErrors({});
    onCancel();
  };

  const fields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'e.g., Chicken Breast',
      required: true,
      onBlur: () => validateName('name', formData.name)
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: CATEGORIES,
      required: true
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'number',
      placeholder: 'e.g., 2',
      min: '0',
      step: 'any',
      required: true
    },
    {
      name: 'unit',
      label: 'Unit',
      type: 'select',
      options: UNITS,
      required: true
    },
    {
      name: 'expiryDate',
      label: 'Expiry Date',
      type: 'date',
      required: true
    },
    {
      name: 'location',
      label: 'Location',
      type: 'select',
      options: LOCATIONS,
      required: true
    }
  ];

  return (
    <Form
      title="Add New Ingredient"
      fields={fields}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      validate={validateName}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText="Add Ingredient"
      cancelText="Cancel"
    />
  );
};

export default IngredientForm;