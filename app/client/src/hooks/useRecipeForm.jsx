import { useState } from 'react';

export const useRecipeForm = (initialData = {}, existingRecipes = []) => {
  const [formData, setFormData] = useState({
    name: '',
    cookTime: '',
    servings: '',
    ingredients: '',
    instructions: '',
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  const isRecipeNameTaken = (name) => {
    return existingRecipes.some(
      (recipe) => recipe.name.toLowerCase() === name.toLowerCase()
    );
  };

  const validateName = (fieldName, value) => {
    if (fieldName !== 'name') return;

    if (isRecipeNameTaken(value)) {
      setErrors((prev) => ({
        ...prev,
        name: 'A recipe with this name already exists',
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cookTime: '',
      servings: '',
      ingredients: '',
      instructions: '',
      ...initialData,
    });
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
