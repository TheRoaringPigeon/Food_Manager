export const getRecipeFields = (formData, validateName) => [
  {
    name: "name",
    label: "Recipe Name",
    type: "text",
    placeholder: "Enter recipe name",
    required: true,
    onBlur: () => validateName("name", formData.name),
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
