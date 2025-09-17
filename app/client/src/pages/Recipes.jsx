import { useState, useEffect } from "react";
import { getAllRecipes } from "../api/recipe";
import RecipeCard from "../components/cards/RecipeCard";
import AddButton from "../components/buttons/addButton";
import RecipeForm from "../components/forms/recipeForm";
import RecipeDetails from "../components/details/recipeDetails";
import '../components/searchBar.css';
import './recipes.css';
import { dummyRecipes } from "../constants/dummyRecipeData";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRecipeCreated = (newRecipe) => {
    setRecipes(prev => [...prev, newRecipe]);
    setShowCreateForm(false);
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
  };

  const handleRecipeClose = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="recipes-container">
      <div className="recipes-list">
        <div className="recipes-header">
          <h2>Recipes ({filteredRecipes.length})</h2>
          <div className="header-actions">
            <div className="controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search recipes by name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
            </div>
            <AddButton 
              onClick={() => setShowCreateForm(true)}
              text="Add Recipe"
            />
          </div>
        </div>
        <div className="recipe-cards">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))}
          {filteredRecipes.length === 0 && searchTerm && (
            <div className="no-results">
              <p>No recipes found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      <RecipeDetails 
        recipe={selectedRecipe} 
        onClose={handleRecipeClose} 
      />

      {showCreateForm && (
        <RecipeForm
          onSubmit={handleRecipeCreated}
          onCancel={handleFormCancel}
          existingRecipes={recipes}
        />
      )}
    </div>
  );
}

export default Recipes;