import { useState, useEffect } from "react";
import { getAllRecipes, getRecipeByID } from "../api/recipe";
// Dummy data for recipes
const dummyRecipes = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    cookTime: "20 minutes",
    servings: 4,
    ingredients: ["spaghetti", "eggs", "bacon", "parmesan", "black pepper"],
    instructions:
      "1. Cook pasta according to package directions. 2. Fry bacon until crispy. 3. Whisk eggs and cheese. 4. Combine all ingredients off heat.",
  },
  {
    id: 2,
    name: "Chicken Stir Fry",
    cookTime: "15 minutes",
    servings: 3,
    ingredients: [
      "chicken breast",
      "broccoli",
      "bell peppers",
      "soy sauce",
      "garlic",
      "ginger",
    ],
    instructions:
      "1. Cut chicken into strips. 2. Heat oil in wok. 3. Cook chicken until done. 4. Add vegetables and stir fry. 5. Add sauce and serve.",
  },
  {
    id: 3,
    name: "Chocolate Chip Cookies",
    cookTime: "12 minutes",
    servings: 24,
    ingredients: [
      "flour",
      "butter",
      "sugar",
      "brown sugar",
      "eggs",
      "vanilla",
      "chocolate chips",
    ],
    instructions:
      "1. Cream butter and sugars. 2. Add eggs and vanilla. 3. Mix in flour. 4. Fold in chocolate chips. 5. Bake at 375°F.",
  },
];

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const fetchAllRecipes = async () => {
    try {
      const response = await getAllRecipes();
      setRecipes(response.results.recipes);
    } catch (err) {
      console.error("Failed to fetch recipe(s): ", err);
      setRecipes(dummyRecipes);
    }
  };

  useEffect(() => {
    fetchAllRecipes();
  }, []);

  return (
    <div className="recipes-container">
      <div className="recipes-list">
        <h2>Recipes ({recipes.length})</h2>
        <div className="recipe-cards">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="recipe-card"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <h3>{recipe.name}</h3>
              <div className="recipe-meta">
                <span className="cook-time">🕒 {recipe.cookTime}</span>
                <span className="servings">👥 {recipe.servings} servings</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedRecipe && (
        <div className="recipe-details">
          <div className="recipe-header">
            <h2>{selectedRecipe.name}</h2>
            <button
              className="close-button"
              onClick={() => setSelectedRecipe(null)}
            >
              ✕
            </button>
          </div>
          <div className="recipe-meta">
            <span>🕒 Cook Time: {selectedRecipe.cookTime}</span>
            <span>👥 Servings: {selectedRecipe.servings}</span>
          </div>
          <div className="recipe-content">
            <div className="ingredients-section">
              <h3>Ingredients</h3>
              <ul>
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
            <div className="instructions-section">
              <h3>Instructions</h3>
              <p>{selectedRecipe.instructions}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recipes;
