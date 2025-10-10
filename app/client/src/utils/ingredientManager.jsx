import { useState } from 'react';
import './ingredientManager.css'; // You'll need to create this CSS file

const IngredientManager = ({ 
  ingredients = [], 
  onChange, 
  availableIngredients = [],
  errors = {} 
}) => {
  const [newIngredient, setNewIngredient] = useState({
    ingredientId: '',
    recipeQuantity: '',
    recipeUnit: '',
    isOptional: false,
    notes: ''
  });

  const handleAddIngredient = () => {
    // Validation
    if (!newIngredient.ingredientId || !newIngredient.recipeQuantity) {
      return;
    }

    // Check if ingredient already exists in the recipe
    const exists = ingredients.some(ing => ing.ingredientId === parseInt(newIngredient.ingredientId));
    if (exists) {
      alert('This ingredient is already in the recipe');
      return;
    }

    const ingredientToAdd = {
      ...newIngredient,
      ingredientId: parseInt(newIngredient.ingredientId),
      recipeQuantity: parseFloat(newIngredient.recipeQuantity),
      isOptional: Boolean(newIngredient.isOptional)
    };

    onChange([...ingredients, ingredientToAdd]);
    
    // Reset form
    setNewIngredient({
      ingredientId: '',
      recipeQuantity: '',
      recipeUnit: '',
      isOptional: false,
      notes: ''
    });
  };

  const handleRemoveIngredient = (index) => {
    const updated = ingredients.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index] = {
      ...updated[index],
      [field]: field === 'ingredientId' ? parseInt(value) : 
               field === 'recipeQuantity' ? parseFloat(value) :
               field === 'isOptional' ? Boolean(value) : value
    };
    onChange(updated);
  };

  return (
    <div className="ingredient-manager">
      <h4>Recipe Ingredients</h4>
      
      {/* Current Ingredients List */}
      {console.log(ingredients)}
      {ingredients.length > 0 && (
        <div className="current-ingredients">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-item">
              <div className="ingredient-info">
                <span className="ingredient-name">
                  {(ingredient.name)}
                </span>
                <div className="ingredient-details">
                  <input
                    type="number"
                    value={ingredient.RecipeIngredient.recipeQuantity}
                    onChange={(e) => handleUpdateIngredient(index, 'recipeQuantity', e.target.value)}
                    step="0.01"
                    min="0"
                    className="quantity-input"
                  />
                  <input
                    type="text"
                    value={ingredient.RecipeIngredient.recipeUnit || ''}
                    onChange={(e) => handleUpdateIngredient(index, 'recipeUnit', e.target.value)}
                    placeholder="unit"
                    className="unit-input"
                  />
                  <label className="optional-label">
                    <input
                      type="checkbox"
                      checked={ingredient.RecipeIngredient.isOptional}
                      onChange={(e) => handleUpdateIngredient(index, 'isOptional', e.target.checked)}
                    />
                    Optional
                  </label>
                </div>
                {ingredient.notes && (
                  <div className="ingredient-notes">
                    <small>Notes: {ingredient.RecipeIngredient.notes}</small>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                className="remove-ingredient-btn"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Ingredient Form */}
      <div className="add-ingredient-form">
        <h5>Add Ingredient</h5>
        <div className="ingredient-form-row">
          <select
            value={newIngredient.ingredientId}
            onChange={(e) => setNewIngredient(prev => ({
              ...prev,
              ingredientId: e.target.value
            }))}
            className="ingredient-select"
          >
            <option value="">Select Ingredient</option>
            {availableIngredients
              .filter(ing => !ingredients.some(existing => existing.ingredientId === ing.id))
              .map(ingredient => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </option>
              ))}
          </select>
          
          <input
            type="number"
            value={newIngredient.recipeQuantity}
            onChange={(e) => setNewIngredient(prev => ({
              ...prev,
              recipeQuantity: e.target.value
            }))}
            placeholder="Quantity"
            step="0.01"
            min="0"
            className="quantity-input"
          />
          
          <input
            type="text"
            value={newIngredient.recipeUnit}
            onChange={(e) => setNewIngredient(prev => ({
              ...prev,
              recipeUnit: e.target.value
            }))}
            placeholder="Unit (e.g., cups, oz)"
            className="unit-input"
          />
        </div>
        
        <div className="ingredient-form-row">
          <label className="optional-label">
            <input
              type="checkbox"
              checked={newIngredient.isOptional}
              onChange={(e) => setNewIngredient(prev => ({
                ...prev,
                isOptional: e.target.checked
              }))}
            />
            Optional ingredient
          </label>
        </div>
        
        <div className="ingredient-form-row">
          <input
            type="text"
            value={newIngredient.notes}
            onChange={(e) => setNewIngredient(prev => ({
              ...prev,
              notes: e.target.value
            }))}
            placeholder="Notes (optional)"
            className="notes-input"
          />
        </div>
        
        <button
          type="button"
          onClick={handleAddIngredient}
          disabled={!newIngredient.ingredientId || !newIngredient.recipeQuantity}
          className="add-ingredient-btn"
        >
          Add Ingredient
        </button>
      </div>
      
      {errors.ingredients && (
        <small style={{ color: '#e70966' }}>
          {errors.ingredients}
        </small>
      )}
    </div>
  );
};

export default IngredientManager;