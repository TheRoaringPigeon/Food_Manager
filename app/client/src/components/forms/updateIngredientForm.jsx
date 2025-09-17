import { useState } from 'react';
import Form from './form';
import { updateIngredient, searchIngredients } from '../../api/ingredient';
import { CATEGORIES, UNITS, LOCATIONS } from '../../constants/ingredientConstants';

const UpdateIngredientForm = ({ ingredient, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: ingredient.name || "",
    category: ingredient.category || "",
    quantity: ingredient.quantity || "",
    unit: ingredient.unit || "",
    expiryDate: ingredient.expiryDate || "",
    location: ingredient.location || "",
  });
  
  const [errors, setErrors] = useState({});

  const validateName = async (name, value) => {
    if (name !== 'name') return;
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, name: "Name is required" }));
      return;
    }

    // Skip validation if the name hasn't changed
    if (value.toLowerCase() === ingredient.name.toLowerCase()) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
      return;
    }

    try {
      const response = await searchIngredients(value);
      if (response.success) {
        const existingIngredient = response.results.find(
          ing => ing.name.toLowerCase() === value.toLowerCase() && ing.id !== ingredient.id
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
        "The name desired was already taken. Please either enter a new name or choose a different one."
      );
      return;
    }

    try {
      const response = await updateIngredient(ingredient.id, data);
      onSubmit({ ...data, id: ingredient.id });
    } catch (err) {
      console.error("Failed to update ingredient: ", err);
      alert("Failed to update ingredient. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: ingredient.name || "",
      category: ingredient.category || "",
      quantity: ingredient.quantity || "",
      unit: ingredient.unit || "",
      expiryDate: ingredient.expiryDate || "",
      location: ingredient.location || "",
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
      title="Update Ingredient"
      fields={fields}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      validate={validateName}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText="Update Ingredient"
      cancelText="Cancel"
    />
  );
};

export default UpdateIngredientForm;