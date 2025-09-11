/**
 * Recipe Service - Updated for PostgreSQL with Sequelize ORM
 * Contains business logic for recipe operations
 */

const Recipe = require('../models/Recipe');
const { Op } = require('sequelize');

class RecipeService {
  // Get all recipes with optional pagination
  async getAllRecipes(page = 1, limit = 10) {
    try {
      const result = await Recipe.getAllRecipes(page, limit);
      
      // Convert recipes to JSON format
      const recipes = result.recipes.map(recipe => recipe.toJSON());
      return {
        recipes,
        pagination: {
          totalCount: result.totalCount,
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev
        }
      };
    } catch (error) {
      throw new Error(`Failed to retrieve recipes: ${error.message}`);
    }
  }

  // Get all recipes without pagination (for backward compatibility)
  async getAllRecipesSimple() {
    try {
      const recipes = await Recipe.findAll({
        order: [['updatedAt', 'DESC']]
      });
      
      return recipes.map(recipe => recipe.toJSON());
    } catch (error) {
      throw new Error(`Failed to retrieve recipes: ${error.message}`);
    }
  }

  // Get recipe by ID
  async getRecipeById(id) {
    try {
      const recipe = await Recipe.findByPk(id);
      return recipe ? recipe.toJSON() : null;
    } catch (error) {
      throw new Error(`Failed to retrieve recipe: ${error.message}`);
    }
  }

  // Create new recipe
  async createRecipe(data) {
    try {
      const recipe = await Recipe.createRecipe(data);
      return recipe.toJSON();
    } catch (error) {
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message);
        throw new Error(validationErrors.join(', '));
      }
      throw new Error(error.message);
    }
  }

  // Update recipe
  async updateRecipe(id, data) {
    try {
      const recipe = await Recipe.findByPk(id);
      
      if (!recipe) {
        return null;
      }

      await recipe.updateRecipe(data);
      return recipe.toJSON();
    } catch (error) {
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message);
        throw new Error(validationErrors.join(', '));
      }
      throw new Error(error.message);
    }
  }

  // Delete recipe
  async deleteRecipe(id) {
    try {
      const recipe = await Recipe.findByPk(id);
      
      if (!recipe) {
        return false;
      }

      await recipe.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`);
    }
  }

  // Search recipes
  async searchRecipes(query) {
    try {
      const recipes = await Recipe.searchRecipes(query);
      return recipes.map(recipe => recipe.toJSON());
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  // Get recipes by servings range
  async getRecipesByServings(minServings, maxServings) {
    try {
      const recipes = await Recipe.findAll({
        where: {
          servings: {
            [Op.between]: [minServings, maxServings]
          }
        },
        order: [['servings', 'ASC']]
      });

      return recipes.map(recipe => recipe.toJSON());
    } catch (error) {
      throw new Error(`Failed to retrieve recipes by servings: ${error.message}`);
    }
  }

  // Get recipes by ingredient
  async getRecipesByIngredient(ingredient) {
    try {
      const recipes = await Recipe.findAll({
        where: {
          ingredients: {
            [Op.iLike]: `%${ingredient.toLowerCase()}%`
          }
        },
        order: [['name', 'ASC']]
      });

      return recipes.map(recipe => recipe.toJSON());
    } catch (error) {
      throw new Error(`Failed to retrieve recipes by ingredient: ${error.message}`);
    }
  }

  // Get recipe statistics
  async getRecipeStats() {
    try {
      const { fn, col } = require('sequelize');
      
      const stats = await Recipe.findOne({
        attributes: [
          [fn('COUNT', col('id')), 'totalRecipes'],
          [fn('AVG', col('servings')), 'averageServings'],
          [fn('MIN', col('servings')), 'minServings'],
          [fn('MAX', col('servings')), 'maxServings']
        ],
        raw: true
      });

      return {
        totalRecipes: parseInt(stats.totalRecipes) || 0,
        averageServings: parseFloat(stats.averageServings) || 0,
        minServings: parseInt(stats.minServings) || 0,
        maxServings: parseInt(stats.maxServings) || 0
      };
    } catch (error) {
      throw new Error(`Failed to retrieve recipe statistics: ${error.message}`);
    }
  }

  // Bulk create recipes (useful for seeding or imports)
  async bulkCreateRecipes(recipesData) {
    try {
      // Validate all recipes first
      for (const data of recipesData) {
        const validation = Recipe.validateData(data);
        if (!validation.isValid) {
          throw new Error(`Invalid recipe data: ${validation.errors.join(', ')}`);
        }
      }

      // Prepare data for bulk creation
      const preparedData = recipesData.map(data => ({
        name: data.name.trim(),
        cookTime: data.cookTime.trim(),
        servings: data.servings,
        ingredients: JSON.stringify(data.ingredients.map(i => i.trim())),
        instructions: data.instructions.trim()
      }));

      const recipes = await Recipe.bulkCreate(preparedData, {
        returning: true
      });

      return recipes.map(recipe => recipe.toJSON());
    } catch (error) {
      throw new Error(`Failed to bulk create recipes: ${error.message}`);
    }
  }
}

// Export a singleton instance
module.exports = new RecipeService();