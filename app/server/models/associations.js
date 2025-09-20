/**
 * Model Associations Setup
 * Define relationships between models
 * This file should be placed in your models directory as associations.js
 */

const Recipe = require('./Recipe');
const Ingredient = require('./Ingredient');
const RecipeIngredient = require('./RecipeIngredient');

// Define many-to-many associations
Recipe.belongsToMany(Ingredient, { 
  through: RecipeIngredient,
  foreignKey: 'recipeId',
  otherKey: 'ingredientId',
  as: 'ingredients' // This allows you to use recipe.getIngredients()
});

Ingredient.belongsToMany(Recipe, { 
  through: RecipeIngredient,
  foreignKey: 'ingredientId',
  otherKey: 'recipeId',
  as: 'recipes' // This allows you to use ingredient.getRecipes()
});

// Direct associations for easier access to junction table
Recipe.hasMany(RecipeIngredient, {
  foreignKey: 'recipeId',
  as: 'recipeIngredients',
  onDelete: 'CASCADE'
});

Ingredient.hasMany(RecipeIngredient, {
  foreignKey: 'ingredientId',
  as: 'ingredientRecipes',
  onDelete: 'CASCADE'
});

RecipeIngredient.belongsTo(Recipe, {
  foreignKey: 'recipeId',
  as: 'recipe'
});

RecipeIngredient.belongsTo(Ingredient, {
  foreignKey: 'ingredientId',
  as: 'ingredient'
});

module.exports = {
  Recipe,
  Ingredient,
  RecipeIngredient
};