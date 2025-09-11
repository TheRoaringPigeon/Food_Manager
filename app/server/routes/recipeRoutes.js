/**
 * Recipe Routes
 * Defines all recipe-related endpoints and maps them to controller methods
 */

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Recipe API Documentation',
    version: '1.0.0',
    endpoints: {
      'GET /api/recipes': 'Get all recipes (supports ?page=1&limit=10&simple=true)',
      'GET /api/recipes/:id': 'Get recipe by ID',
      'POST /api/recipes': 'Create new recipe',
      'PUT /api/recipes/:id': 'Update recipe',
      'DELETE /api/recipes/:id': 'Delete recipe',
      'GET /api/recipes/search?q=query': 'Search recipes',
    },
    sampleRecipe: {
      name: "Sample Recipe",
      cookTime: "30 minutes",
      servings: 4,
      ingredients: ["ingredient 1", "ingredient 2", "ingredient 3"],
      instructions: "Step 1. Do this. Step 2. Do that."
    }
  });
});

// Special routes (must come before /:id route to avoid conflicts)
router.get('/recipes/search', recipeController.searchRecipes);

// CRUD routes
router.get('/recipes', recipeController.getAllRecipes);
router.get('/recipes/:id', recipeController.getRecipeById);
router.post('/recipes', recipeController.createRecipe);
router.put('/recipes/:id', recipeController.updateRecipe);
router.delete('/recipes/:id', recipeController.deleteRecipe);

module.exports = router;