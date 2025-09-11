/**
 * Recipe Controller
 * Handles HTTP requests and responses for recipe endpoints
 * Similar to FastAPI route handlers
 */

const recipeService = require('../services/recipeService');

class RecipeController {
    // GET /api/recipes - Get all recipes
    async getAllRecipes(req, res) {
        try {
            const recipes = await recipeService.getAllRecipes();
            res.json({
                success: true,
                results: recipes,
                count: recipes.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve recipes',
                error: error.message
            });
        }
    }

    // GET /api/recipes/:id - Get specific recipe
    async getRecipeById(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid recipe ID'
                });
            }

            const recipe = await recipeService.getRecipeById(id);
            
            if (!recipe) {
                return res.status(404).json({
                    success: false,
                    message: 'Recipe not found'
                });
            }

            res.json({
                success: true,
                results: recipe
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve recipe',
                error: error.message
            });
        }
    }

    // POST /api/recipes - Create new recipe
    async createRecipe(req, res) {
        try {
            const recipe = await recipeService.createRecipe(req.body);
            
            res.status(201).json({
                success: true,
                results: recipe,
                message: 'Recipe created successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/recipes/:id - Update recipe
    async updateRecipe(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid recipe ID'
                });
            }

            const recipe = await recipeService.updateRecipe(id, req.body);
            
            if (!recipe) {
                return res.status(404).json({
                    success: false,
                    message: 'Recipe not found'
                });
            }

            res.json({
                success: true,
                results: recipe,
                message: 'Recipe updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // DELETE /api/recipes/:id - Delete recipe
    async deleteRecipe(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid recipe ID'
                });
            }

            const deleted = await recipeService.deleteRecipe(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Recipe not found'
                });
            }

            res.json({
                success: true,
                message: 'Recipe deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete recipe',
                error: error.message
            });
        }
    }

    // GET /api/recipes/search?q=query - Search recipes
    async searchRecipes(req, res) {
        try {
            const query = req.query.q;
            
            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const recipes = await recipeService.searchRecipes(query);
            
            res.json({
                success: true,
                results: recipes,
                count: recipes.length,
                query: query
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Search failed',
                error: error.message
            });
        }
    }
}

module.exports = new RecipeController();