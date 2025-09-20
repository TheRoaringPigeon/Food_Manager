/**
 * Recipe Controller
 * Handles HTTP requests and responses for recipe endpoints
 * Updated to support ingredient associations
 */

const recipeService = require('../services/recipeService');

class RecipeController {
    // GET /api/recipes - Get all recipes with pagination
    async getAllRecipes(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            const result = await recipeService.getAllRecipes(page, limit);
            
            res.json({
                success: true,
                results: result.recipes,
                count: result.recipes.length,
                pagination: result.pagination
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve recipes',
                error: error.message
            });
        }
    }

    // GET /api/recipes/:id - Get specific recipe with ingredients
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

    // POST /api/recipes - Create new recipe with ingredients
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

    // PUT /api/recipes/:id - Update recipe with ingredients
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

    // GET /api/recipes/search?q=query - Search recipes and ingredients
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

    // GET /api/recipes/by-servings?min=2&max=6 - Get recipes by serving range
    async getRecipesByServings(req, res) {
        try {
            const minServings = parseInt(req.query.min) || 1;
            const maxServings = parseInt(req.query.max) || 10;
            
            if (minServings > maxServings) {
                return res.status(400).json({
                    success: false,
                    message: 'Minimum servings cannot be greater than maximum servings'
                });
            }

            const recipes = await recipeService.getRecipesByServings(minServings, maxServings);
            
            res.json({
                success: true,
                results: recipes,
                count: recipes.length,
                filters: { minServings, maxServings }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve recipes by servings',
                error: error.message
            });
        }
    }

    // GET /api/recipes/by-ingredient?name=chicken - Get recipes by ingredient name
    async getRecipesByIngredient(req, res) {
        try {
            const ingredientName = req.query.name;
            
            if (!ingredientName) {
                return res.status(400).json({
                    success: false,
                    message: 'Ingredient name is required'
                });
            }

            const recipes = await recipeService.getRecipesByIngredient(ingredientName);
            
            res.json({
                success: true,
                results: recipes,
                count: recipes.length,
                ingredient: ingredientName
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve recipes by ingredient',
                error: error.message
            });
        }
    }

    // GET /api/recipes/by-ingredient-id/:ingredientId - Get recipes by ingredient ID
    async getRecipesByIngredientId(req, res) {
        try {
            const ingredientId = parseInt(req.params.ingredientId);
            
            if (isNaN(ingredientId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ingredient ID'
                });
            }

            const recipes = await recipeService.getRecipesByIngredientId(ingredientId);
            
            res.json({
                success: true,
                results: recipes,
                count: recipes.length,
                ingredientId: ingredientId
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve recipes by ingredient ID',
                error: error.message
            });
        }
    }

    // POST /api/recipes/:id/ingredients - Add ingredient to recipe
    async addIngredientToRecipe(req, res) {
        try {
            const recipeId = parseInt(req.params.id);
            
            if (isNaN(recipeId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid recipe ID'
                });
            }

            const { ingredientId, recipeQuantity, recipeUnit, isOptional, notes } = req.body;

            if (!ingredientId || !recipeQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Ingredient ID and recipe quantity are required'
                });
            }

            const updatedRecipe = await recipeService.addIngredientToRecipe(recipeId, {
                ingredientId,
                recipeQuantity,
                recipeUnit,
                isOptional,
                notes
            });

            res.json({
                success: true,
                results: updatedRecipe,
                message: 'Ingredient added to recipe successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // DELETE /api/recipes/:id/ingredients/:ingredientId - Remove ingredient from recipe
    async removeIngredientFromRecipe(req, res) {
        try {
            const recipeId = parseInt(req.params.id);
            const ingredientId = parseInt(req.params.ingredientId);
            
            if (isNaN(recipeId) || isNaN(ingredientId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid recipe ID or ingredient ID'
                });
            }

            const removed = await recipeService.removeIngredientFromRecipe(recipeId, ingredientId);
            
            if (!removed) {
                return res.status(404).json({
                    success: false,
                    message: 'Ingredient not found in recipe'
                });
            }

            res.json({
                success: true,
                message: 'Ingredient removed from recipe successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/recipes/stats - Get recipe statistics
    async getRecipeStats(req, res) {
        try {
            const stats = await recipeService.getRecipeStats();
            
            res.json({
                success: true,
                results: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve recipe statistics',
                error: error.message
            });
        }
    }

    // POST /api/recipes/makable - Get recipes that can be made with available ingredients
    async getRecipesWithAvailableIngredients(req, res) {
        try {
            const { availableIngredientIds } = req.body;
            
            if (!Array.isArray(availableIngredientIds) || availableIngredientIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Available ingredient IDs array is required'
                });
            }

            // Validate that all IDs are numbers
            const validIds = availableIngredientIds.every(id => Number.isInteger(id));
            if (!validIds) {
                return res.status(400).json({
                    success: false,
                    message: 'All ingredient IDs must be valid numbers'
                });
            }

            const recipes = await recipeService.getRecipesWithAvailableIngredients(availableIngredientIds);
            
            res.json({
                success: true,
                results: recipes,
                count: recipes.length,
                availableIngredients: availableIngredientIds.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to find makable recipes',
                error: error.message
            });
        }
    }

    // POST /api/recipes/bulk - Bulk create recipes
    async bulkCreateRecipes(req, res) {
        try {
            const { recipes } = req.body;
            
            if (!Array.isArray(recipes) || recipes.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Recipes array is required'
                });
            }

            const createdRecipes = await recipeService.bulkCreateRecipes(recipes);
            
            res.status(201).json({
                success: true,
                results: createdRecipes,
                count: createdRecipes.length,
                message: `${createdRecipes.length} recipes created successfully`
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new RecipeController();