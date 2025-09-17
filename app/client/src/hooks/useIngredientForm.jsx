import { useState } from 'react';
import { searchIngredients } from '../api/ingredient';

export const useIngredientForm = (initialData = {}, existingId = null) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    expiryDate: '',
    location: '',
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  const validateName = async (name, value) => {
    if (name !== 'name') return;

    if (!value.trim()) {
      setErrors(prev => ({ ...prev, name: 'Name is required' }));
      return;
    }

    try {
      const response = await searchIngredients(value);
      if (response.success) {
        const existingIngredient = response.results.find(
          ing => ing.name.toLowerCase() === value.toLowerCase() &&
                 (!existingId || ing.id !== existingId)
        );

        if (existingIngredient) {
          setErrors(prev => ({ ...prev, name: `${value} is already used.` }));
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
      setErrors(prev => ({ ...prev, name: 'Error checking name in DB' }));
    }
  };

  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
  };

  return {
    formData,
    setFormData,
    errors,
    validateName,
    resetForm,
  };
};
