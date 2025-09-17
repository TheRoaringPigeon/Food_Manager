import { useIngredientForm } from '../../hooks/useIngredientForm';
import { getIngredientFields } from '../../utils/getIngredientFields';
import { updateIngredient } from '../../api/ingredient';
import Form from './form';

const UpdateIngredientForm = ({ ingredient, onSubmit, onCancel }) => {
  const {
    formData,
    setFormData,
    errors,
    validateName,
    resetForm
  } = useIngredientForm(ingredient, ingredient.id); // Initial data + existing ID for validation

  const handleSubmit = async (data) => {
    if (errors.name) {
      alert("The name is already in use. Please enter a different one.");
      return;
    }

    try {
      await updateIngredient(ingredient.id, data);
      onSubmit({ ...data, id: ingredient.id });
    } catch (err) {
      console.error("Failed to update ingredient: ", err);
      alert("Failed to update ingredient. Please try again.");
    }
  };

  return (
    <Form
      title="Update Ingredient"
      fields={getIngredientFields(formData, validateName)}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      validate={validateName}
      onSubmit={handleSubmit}
      onCancel={() => {
        resetForm();
        onCancel();
      }}
      submitText="Update Ingredient"
      cancelText="Cancel"
    />
  );
};

export default UpdateIngredientForm;