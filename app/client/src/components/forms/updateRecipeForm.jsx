import { useRecipeForm } from '../../hooks/useRecipeForm';
import { getRecipeFields } from '../../utils/getRecipeFields';
import { updateRecipe } from '../../api/recipe';
import Form from './form';

const UpdateRecipeForm = ({ recipe, onSubmit, onCancel }) => {
  const {
    formData,
    setFormData,
    errors,
    validateName,
    resetForm
  } = useRecipeForm(recipe, recipe.id);

  const handleSubmit = async (data) => {
    if (errors.name) {
      alert("The name is already in use. Please enter a different one.");
      return;
    }

    try {
      await updateRecipe(recipe.id, data);
      onSubmit({ ...data, id: recipe.id });
    } catch (err) {
      console.error("Failed to update recipe: ", err);
      alert("Failed to update recipe. Please try again.");
    }
  };

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
    />
  );
};

export default UpdateRecipeForm;