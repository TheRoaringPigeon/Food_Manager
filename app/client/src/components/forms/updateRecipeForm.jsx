import { useState, useEffect } from 'react';
import { useRecipeForm } from '../../hooks/useRecipeForm';
import { getRecipeFields } from '../../utils/getRecipeFields';
import { updateRecipe } from '../../api/recipe';
import { getAllIngredients } from '../../api/ingredient';
import Form from './form';
import IngredientManager from '../../utils/ingredientManager';

const UpdateRecipeForm = ({ 
  recipe, 
  onSubmit, 
  onCancel
}) => {
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const {
    formData,
    setFormData,
    errors,
    validateName,
    resetForm
  } = useRecipeForm(recipe, recipe.id);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const ingredients = await getAllIngredients();
        setAvailableIngredients(ingredients.results.ingredients);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        alert('Failed to load ingredients');
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const handleSubmit = async (data) => {
    // Required field check
    if (
      !data.name ||
      !data.cookTime ||
      !data.servings ||
      !data.ingredients ||
      data.ingredients.length === 0 ||
      !data.instructions
    ) {
      alert("Please fill in all required fields and add at least one ingredient");
      return;
    }

    if (errors.name) {
      alert("The name is already in use. Please enter a different one.");
      return;
    }

    try {
      const updatedData = {
        ...data,
        servings: parseInt(data.servings, 10),
        // ingredients is already an array of ingredient objects
      };
      
      await updateRecipe(recipe.id, updatedData);
      onSubmit({ ...updatedData, id: recipe.id });
    } catch (err) {
      console.error("Failed to update recipe: ", err);
      alert("Failed to update recipe. Please try again.");
    }
  };

  const handleIngredientsChange = (ingredients) => {
    setFormData(prev => ({
      ...prev,
      ingredients
    }));
  };

  if (loading) {
    return (
      <div className="create-form-overlay">
        <div className="create-form-container">
          <p>Loading ingredients...</p>
        </div>
      </div>
    );
  }

  return (
    <Form
      title="Update Recipe"
      fields={getRecipeFields(formData, validateName)}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      validate={validateName}
      onSubmit={handleSubmit}
      onCancel={() => {
        resetForm();
        onCancel();
      }}
      submitText="Update Recipe"
      cancelText="Cancel"
    >
      {/* Add IngredientManager as a child component */}
      <IngredientManager
        ingredients={formData.ingredients || []}
        onChange={handleIngredientsChange}
        availableIngredients={availableIngredients}
        errors={errors}
      />
    </Form>
  );
};

export default UpdateRecipeForm;