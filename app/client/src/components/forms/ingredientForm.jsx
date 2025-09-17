import { useIngredientForm } from '../../hooks/useIngredientForm';
import { getIngredientFields } from '../../utils/getIngredientFields';
import { createIngredient } from '../../api/ingredient';
import Form from './form';

const IngredientForm = ({ onSubmit, onCancel }) => {
  const {
    formData,
    setFormData,
    errors,
    validateName,
    resetForm
  } = useIngredientForm();

  const handleSubmit = async (data) => {
    if (errors.name) {
      alert("Name already taken.");
      return;
    }

    try {
      const response = await createIngredient(data);
      onSubmit({ ...data, id: response.results.id });
    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create ingredient.");
    }
  };

  return (
    <Form
      title="Add New Ingredient"
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
      submitText="Add Ingredient"
      cancelText="Cancel"
    />
  );
};

export default IngredientForm;