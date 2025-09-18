import { createRecipe } from '../../api/recipe';
import { useRecipeForm } from '../..//hooks/useRecipeForm';
import { getRecipeFields } from '../../utils/getRecipeFields';
import Form from './form';

const RecipeForm = ({ onSubmit, onCancel, existingRecipes = [] }) => {
  const {
    formData,
    setFormData,
    errors,
    validateName,
    resetForm
  } = useRecipeForm({}, existingRecipes);

  const handleSubmit = async (data) => {
    // Required field check (optional if handled in <Form>)
    if (
      !data.name ||
      !data.cookTime ||
      !data.servings ||
      !data.ingredients ||
      !data.instructions
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (errors.name) {
      alert("A recipe with this name already exists");
      return;
    }

    try {
      const ingredientsArray = data.ingredients
        .split(',')
        .map((ingredient) => ingredient.trim())
        .filter((ingredient) => ingredient.length > 0);

      const response = await createRecipe({
        ...data,
        ingredients: ingredientsArray,
        servings: parseInt(data.servings, 10),
      });
      
      onSubmit(response.results);
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe');
    }
  };

  return (
    <Form
      title="Create New Recipe"
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
      submitText="Create Recipe"
      cancelText="Cancel"
    />
  );
};

export default RecipeForm;
