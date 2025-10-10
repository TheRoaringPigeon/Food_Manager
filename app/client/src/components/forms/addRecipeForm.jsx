import { createRecipe } from "../../api/recipe";
import { useRecipeForm } from "../../hooks/useRecipeForm";
import { getRecipeFields } from "../../utils/getRecipeFields";
import Form from "./form";
import IngredientManager from "../../utils/ingredientManager";

const RecipeForm = ({
  onSubmit,
  onCancel,
  existingRecipes = [],
  availableIngredients = [], // Add this prop to pass available ingredients
}) => {
  const { formData, setFormData, errors, validateName, resetForm } =
    useRecipeForm(
      {
        ingredients: [], // Initialize ingredients as empty array
      },
      existingRecipes
    );

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
      alert(
        "Please fill in all required fields and add at least one ingredient"
      );
      return;
    }

    if (errors.name) {
      alert("A recipe with this name already exists");
      return;
    }

    try {
      const response = await createRecipe({
        ...data,
        servings: parseInt(data.servings, 10),
        // ingredients is already an array of ingredient objects
      });

      onSubmit(response.results);
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to create recipe");
    }
  };

  const handleIngredientsChange = (ingredients) => {
    setFormData((prev) => ({
      ...prev,
      ingredients,
    }));
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
    >
      <IngredientManager
        ingredients={formData.ingredients || []}
        onChange={handleIngredientsChange}
        availableIngredients={availableIngredients}
        errors={errors}
      />
    </Form>
  );
};

export default RecipeForm;
