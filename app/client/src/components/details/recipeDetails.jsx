import React from 'react';
import './recipeDetails.css';

function RecipeDetails({ recipe, onClose }) {
  if (!recipe) return null;

  return (
    <div className="recipe-details">
      <div className="recipe-header">
        <h2>{recipe.name}</h2>
        <button
          className="close-button"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="recipe-meta">
        <span>🕒 Cook Time: {recipe.cookTime}</span>
        <span>👥 Servings: {recipe.servings}</span>
      </div>
      <div className="recipe-content">
        <div className="ingredients-section">
          <h3>Ingredients</h3>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div className="instructions-section">
          <h3>Instructions</h3>
          <p>{recipe.instructions}</p>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetails;