import { useState, useEffect } from "react";
import { getAllRecipes, getRecipeByID } from "../api/recipe";
import '../components/searchBar.css'

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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    cookTime: "",
    servings: "",
    ingredients: "",
    instructions: ""
  });
  const [nameError, setNameError] = useState(false);

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

  // Check if recipe name already exists
  const isRecipeNameTaken = (name) => {
    return recipes.some(recipe => 
      recipe.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check for name duplicates
    if (name === 'name') {
      setNameError(isRecipeNameTaken(value));
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.cookTime || !formData.servings || 
        !formData.ingredients || !formData.instructions) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for duplicate name
    if (isRecipeNameTaken(formData.name)) {
      setNameError(true);
      alert('A recipe with this name already exists');
      return;
    }

    try {
      // Convert ingredients string to array (assuming comma-separated)
      const ingredientsArray = formData.ingredients
        .split(',')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0);

      const newRecipe = {
        id: Date.now(), // Temporary ID for dummy data
        name: formData.name,
        cookTime: formData.cookTime,
        servings: parseInt(formData.servings),
        ingredients: ingredientsArray,
        instructions: formData.instructions
      };

      // Add to recipes list (in real app, this would be an API call)
      setRecipes(prev => [...prev, newRecipe]);
      
      // Reset form and close
      setFormData({
        name: "",
        cookTime: "",
        servings: "",
        ingredients: "",
        instructions: ""
      });
      setNameError(false);
      setShowCreateForm(false);
      
      alert('Recipe created successfully!');
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe');
    }
  };

  // Handle form cancellation
  const handleCancel = () => {
    setFormData({
      name: "",
      cookTime: "",
      servings: "",
      ingredients: "",
      instructions: ""
    });
    setNameError(false);
    setShowCreateForm(false);
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
            <button 
              className="add-ingredient-btn"
              onClick={() => setShowCreateForm(true)}
            >
              + Add Recipe
            </button>
          </div>
        </div>
        <div className="recipe-cards">
          {filteredRecipes.map((recipe) => (
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
          {filteredRecipes.length === 0 && searchTerm && (
            <div className="no-results">
              <p>No recipes found matching "{searchTerm}"</p>
            </div>
          )}
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

      {/* Create Recipe Form Overlay */}
      {showCreateForm && (
        <div className="create-form-overlay" onClick={handleCancel}>
          <div className="create-form-container" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Recipe</h3>
            <form className="create-ingredient-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className={nameError ? "nameLabel-error" : "nameLabel-normal"}>
                    Recipe Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter recipe name"
                    required
                    style={{
                      borderColor: nameError ? '#e70966' : '#dee2e6'
                    }}
                  />
                  {nameError && (
                    <small style={{ color: '#e70966' }}>
                      A recipe with this name already exists
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label className="nameLabel-normal">Cook Time *</label>
                  <input
                    type="text"
                    name="cookTime"
                    value={formData.cookTime}
                    onChange={handleInputChange}
                    placeholder="e.g., 30 minutes"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="nameLabel-normal">Servings *</label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  placeholder="Number of servings"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="nameLabel-normal">Ingredients *</label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="Enter ingredients separated by commas (e.g., flour, eggs, milk)"
                  required
                  rows="3"
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="form-group">
                <label className="nameLabel-normal">Instructions *</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  placeholder="Enter cooking instructions..."
                  required
                  rows="5"
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recipes;