import { useState, useEffect } from "react";
import { getAllRecipes } from "../api/recipe";
import RecipeCard from "../components/cards/RecipeCard";
import AddButton from "../components/buttons/addButton";
import RecipeForm from "../components/forms/addRecipeForm";
import UpdateRecipeForm from "../components/forms/updateRecipeForm";
import ScrollBox from "../components/scrollBox/scrollBox";
import SearchBar from "../components/searchBars/searchBar";
import './recipes.css';
import { dummyRecipes } from "../constants/dummyRecipeData";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
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

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRecipeCreated = (newRecipe) => {
    setRecipes(prev => [...prev, newRecipe]);
    setShowCreateForm(false);
  };

  const handleRecipeUpdated = (updatedRecipe) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe
      )
    );
    setShowUpdateForm(false);
    setSelectedRecipe(null);
  };

  const handleCreateFormCancel = () => {
    setShowCreateForm(false);
  };

  const handleUpdateFormCancel = () => {
    setShowUpdateForm(false);
    setSelectedRecipe(null);
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setShowUpdateForm(true);
  };

  return (
    <div className="recipes-container">
      <div className="recipes-header">
        <h2>Recipes ({filteredRecipes.length})</h2>
        <div className="header-actions">
          <div className="controls">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search recipes by name..."
            />
          </div>
          <AddButton 
            onClick={() => setShowCreateForm(true)}
            text="Add Recipe"
          />
        </div>
      </div>

      {showCreateForm && (
        <RecipeForm
          onSubmit={handleRecipeCreated}
          onCancel={handleCreateFormCancel}
          existingRecipes={recipes}
        />
      )}

      {showUpdateForm && selectedRecipe && (
        <UpdateRecipeForm
          recipe={selectedRecipe}
          onSubmit={handleRecipeUpdated}
          onCancel={handleUpdateFormCancel}
        />
      )}
      
      <ScrollBox className="recipes-grid-container">
        <div className="recipes-grid">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => handleRecipeClick(recipe)}
            />
          ))}
          {filteredRecipes.length === 0 && searchTerm && (
            <div className="no-results">
              <p>No recipes found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </ScrollBox>
    </div>
  );
}

export default Recipes;