/**
 * Ingredient Controller
 * Handles HTTP requests and responses for ingredient endpoints
 * Similar to FastAPI route handlers
 */

const ingredientService = require('../services/ingredientService');

class IngredientController {
    // GET /api/ingredients - Get all ingredients
    async getAllIngredients(req, res) {
        try {
            const ingredients = await ingredientService.getAllIngredients();
            res.json({
                success: true,
                results: ingredients,
                count: ingredients.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve ingredients',
                error: error.message
            });
        }
    }

    // GET /api/ingredients/:id - Get specific ingredient
    async getIngredientById(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ingredient ID'
                });
            }

            const ingredient = await ingredientService.getIngredientById(id);
            
            if (!ingredient) {
                return res.status(404).json({
                    success: false,
                    message: 'Ingredient not found'
                });
            }

            res.json({
                success: true,
                results: ingredient
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve ingredient',
                error: error.message
            });
        }
    }

    // POST /api/ingredients - Create new ingredient
    async createIngredient(req, res) {
        try {
            const ingredient = await ingredientService.createIngredient(req.body);
            
            res.status(201).json({
                success: true,
                results: ingredient,
                message: 'Ingredient created successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/ingredients/:id - Update ingredient
    async updateIngredient(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ingredient ID'
                });
            }

            const ingredient = await ingredientService.updateIngredient(id, req.body);
            
            if (!ingredient) {
                return res.status(404).json({
                    success: false,
                    message: 'Ingredient not found'
                });
            }

            res.json({
                success: true,
                results: ingredient,
                message: 'Ingredient updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // DELETE /api/ingredients/:id - Delete ingredient
    async deleteIngredient(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ingredient ID'
                });
            }

            const deleted = await ingredientService.deleteIngredient(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Ingredient not found'
                });
            }

            res.json({
                success: true,
                message: 'Ingredient deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete ingredient',
                error: error.message
            });
        }
    }

    // GET /api/ingredients/search?q=query - Search ingredients
    async searchIngredients(req, res) {
        try {
            const query = req.query.q;
            
            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const ingredients = await ingredientService.searchIngredients(query);
            
            res.json({
                success: true,
                results: ingredients,
                count: ingredients.length,
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

module.exports = new IngredientController();