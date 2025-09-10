/**
 * Recipe Routes
 * Defines API endpoints and connects them to controller methods
 * Similar to FastAPI routers
 */

const express = require('express');
const recipeController = require('../controllers/recipeController');

const router = express.Router();

// Recipe CRUD routes
router.get('/recipes', recipeController.getAllRecipes);
router.get('/recipes/search', recipeController.searchRecipes);  // Must come before /:id
router.get('/recipes/:id', recipeController.getRecipeById);
router.post('/recipes', recipeController.createRecipe);
router.put('/recipes/:id', recipeController.updateRecipe);
router.delete('/recipes/:id', recipeController.deleteRecipe);

module.exports = router;