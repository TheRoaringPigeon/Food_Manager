/**
 * Recipe Service
 * Contains business logic for recipe operations
 * In a real app, this would interact with a database
 */

const Recipe = require('../models/Recipe');

class RecipeService {
    constructor() {
        // In-memory storage (in production, this would be a database)
        this.recipes = [
            Recipe.create(1, {
                name: "Spaghetti Bolognese",
                instructions: "Cook pasta, make sauce, combine"
            }),
            Recipe.create(2, {
                name: "Chocolate Cake", 
                instructions: "Mix ingredients, bake at 350°F for 30 minutes"
            })
        ];
        this.nextId = 3;
    }

    // Get all recipes
    getAllRecipes() {
        return this.recipes.map(recipe => recipe.toJSON());
    }

    // Get recipe by ID
    getRecipeById(id) {
        const recipe = this.recipes.find(r => r.id === id);
        return recipe ? recipe.toJSON() : null;
    }

    // Create new recipe
    createRecipe(data) {
        // Validate data
        const validation = Recipe.validate(data);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        // Create recipe
        const recipe = Recipe.create(this.nextId++, data);
        this.recipes.push(recipe);
        
        return recipe.toJSON();
    }

    // Update recipe
    updateRecipe(id, data) {
        // Validate data
        const validation = Recipe.validate(data);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        // Find recipe
        const recipe = this.recipes.find(r => r.id === id);
        if (!recipe) {
            return null;
        }

        // Update recipe
        recipe.update(data);
        return recipe.toJSON();
    }

    // Delete recipe
    deleteRecipe(id) {
        const index = this.recipes.findIndex(r => r.id === id);
        if (index === -1) {
            return false;
        }

        this.recipes.splice(index, 1);
        return true;
    }

    // Search recipes by name (bonus feature)
    searchRecipes(query) {
        const searchTerm = query.toLowerCase();
        return this.recipes
            .filter(recipe => 
                recipe.name.toLowerCase().includes(searchTerm) ||
                recipe.instructions.toLowerCase().includes(searchTerm)
            )
            .map(recipe => recipe.toJSON());
    }
}

// Export a singleton instance
module.exports = new RecipeService();