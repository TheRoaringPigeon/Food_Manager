import { useState } from "react";
import Form from "./form";
import { createRecipe } from "../../api/recipe";

const RecipeForm = ({ onSubmit, onCancel, existingRecipes = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    cookTime: "",
    servings: "",
    ingredients: "",
    instructions: "",
  });

  const [errors, setErrors] = useState({});

  // Check if recipe name already exists
  const isRecipeNameTaken = (name) => {
    return existingRecipes.some(
      (recipe) => recipe.name.toLowerCase() === name.toLowerCase()
    );
  };

  const validateName = (fieldName, value) => {
    if (fieldName !== "name") return;

    if (isRecipeNameTaken(value)) {
      setErrors((prev) => ({
        ...prev,
        name: "A recipe with this name already exists",
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (data) => {
    // Validate required fields
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

    // Check for duplicate name
    if (isRecipeNameTaken(data.name)) {
      alert("A recipe with this name already exists");
      return;
    }

    try {
      // Convert ingredients string to array (assuming comma-separated)
      const ingredientsArray = data.ingredients
        .split(",")
        .map((ingredient) => ingredient.trim())
        .filter((ingredient) => ingredient.length > 0);
      const response = await createRecipe(
        {
            ...data, 
            ingredients: ingredientsArray,
            servings: parseInt(data.servings, 10)
        });
      onSubmit({...data, id: response.results.id});
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to create recipe");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      cookTime: "",
      servings: "",
      ingredients: "",
      instructions: "",
    });
    setErrors({});
    onCancel();
  };

  const fields = [
    {
      name: "name",
      label: "Recipe Name",
      type: "text",
      placeholder: "Enter recipe name",
      required: true,
    },
    {
      name: "cookTime",
      label: "Cook Time",
      type: "text",
      placeholder: "e.g., 30 minutes",
      required: true,
    },
    {
      name: "servings",
      label: "Servings",
      type: "number",
      placeholder: "Number of servings",
      min: "1",
      required: true,
    },
    {
      name: "ingredients",
      label: "Ingredients",
      type: "textarea",
      placeholder:
        "Enter ingredients separated by commas (e.g., flour, eggs, milk)",
      required: true,
      rows: 3,
    },
    {
      name: "instructions",
      label: "Instructions",
      type: "textarea",
      placeholder: "Enter cooking instructions...",
      required: true,
      rows: 5,
    },
  ];

  return (
    <Form
      title="Create New Recipe"
      fields={fields}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      validate={validateName}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText="Create Recipe"
      cancelText="Cancel"
    />
  );
};

export default RecipeForm;
