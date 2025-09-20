/**
 * Recipe Service - Updated for ingredient associations
 * Contains business logic for recipe operations
 */

const Recipe = require("../models/Recipe");
const Ingredient = require("../models/Ingredient");
const RecipeIngredient = require("../models/RecipeIngredient");
const { Op } = require("sequelize");

class RecipeService {
  // Get all recipes with optional pagination and ingredients
  async getAllRecipes(page = 1, limit = 10) {
    try {
      const result = await Recipe.getAllRecipes(page, limit);

      // Convert recipes to JSON format (ingredients are already included)
      const recipes = result.recipes.map((recipe) => recipe.toJSON());
      return {
        recipes,
        pagination: {
          totalCount: result.totalCount,
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      };
    } catch (error) {
      throw new Error(`Failed to retrieve recipes: ${error.message}`);
    }
  }

  // Get recipe by ID with ingredients
  async getRecipeById(id) {
    try {
      const recipe = await Recipe.findByPk(id, {
        include: [
          {
            model: Ingredient,
            as: 'ingredients', // Use the alias from associations
            through: { 
              attributes: ['recipeQuantity', 'recipeUnit', 'isOptional', 'notes']
            }
          }
        ]
      });
      return recipe ? recipe.toJSON() : null;
    } catch (error) {
      throw new Error(`Failed to retrieve recipe: ${error.message}`);
    }
  }

  // Create new recipe with ingredients
  async createRecipe(data) {
    try {
      const recipe = await Recipe.createRecipe(data);
      
      // Fetch the created recipe with ingredients to return complete data
      const completeRecipe = await Recipe.findByPk(recipe.id, {
        include: [
          {
            model: Ingredient,
            as: 'ingredients', // Use the alias from associations
            through: { 
              attributes: ['recipeQuantity', 'recipeUnit', 'isOptional', 'notes']
            }
          }
        ]
      });
      
      return completeRecipe.toJSON();
    } catch (error) {
      // Handle Sequelize validation errors
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((err) => err.message);
        throw new Error(validationErrors.join(", "));
      }
      throw new Error(error.message);
    }
  }

  // Update recipe with ingredients
  async updateRecipe(id, data) {
    try {
      const recipe = await Recipe.findByPk(id);

      if (!recipe) {
        return null;
      }

      await recipe.updateRecipe(data);
      
      // Fetch updated recipe with ingredients
      const updatedRecipe = await Recipe.findByPk(id, {
        include: [
          {
            model: Ingredient,
            as: 'ingredients', // Use the alias from associations
            through: { 
              attributes: ['recipeQuantity', 'recipeUnit', 'isOptional', 'notes']
            }
          }
        ]
      });
      
      return updatedRecipe.toJSON();
    } catch (error) {
      // Handle Sequelize validation errors
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((err) => err.message);
        throw new Error(validationErrors.join(", "));
      }
      throw new Error(error.message);
    }
  }

  // Delete recipe (cascade will handle recipe_ingredients)
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

  // Search recipes (now includes ingredient search)
  async searchRecipes(query) {
    try {
      const recipes = await Recipe.searchRecipes(query);
      return recipes.map((recipe) => recipe.toJSON());
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
            [Op.between]: [minServings, maxServings],
          },
        },
        include: [
          {
            model: Ingredient,
            as: 'ingredients', // Use the alias from associations
            through: { 
              attributes: ['recipeQuantity', 'recipeUnit', 'isOptional', 'notes']
            }
          }
        ],
        order: [["servings", "ASC"]],
      });

      return recipes.map((recipe) => recipe.toJSON());
    } catch (error) {
      throw new Error(
        `Failed to retrieve recipes by servings: ${error.message}`
      );
    }
  }

  // Get recipes that contain a specific ingredient
  async getRecipesByIngredient(ingredientName) {
    try {
      const recipes = await Recipe.findAll({
        include: [
          {
            model: Ingredient,
            as: 'ingredients', // Use the alias from associations
            where: {
              name: {
                [Op.iLike]: `%${ingredientName.toLowerCase()}%`,
              },
            },
            through: { 
              attributes: ['recipeQuantity', 'recipeUnit', 'isOptional', 'notes']
            }
          }
        ],
        order: [["name", "ASC"]],
      });

      return recipes.map((recipe) => recipe.toJSON());
    } catch (error) {
      throw new Error(
        `Failed to retrieve recipes by ingredient: ${error.message}`
      );
    }
  }

  // Get recipes by ingredient ID
  async getRecipesByIngredientId(ingredientId) {
    try {
      const recipes = await Recipe.findAll({
        include: [
          {
            model: Ingredient,
            as: 'ingredients', // Use the alias from associations
            where: { id: ingredientId },
            through: { 
              attributes: ['recipeQuantity', 'recipeUnit', 'isOptional', 'notes']
            }
          }
        ],
        order: [["name", "ASC"]],
      });

      return recipes.map((recipe) => recipe.toJSON());
    } catch (error) {
      throw new Error(
        `Failed to retrieve recipes by ingredient ID: ${error.message}`
      );
    }
  }

  // Add ingredient to existing recipe
  async addIngredientToRecipe(recipeId, ingredientData) {
    try {
      const recipe = await Recipe.findByPk(recipeId);
      
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      const ingredient = await Ingredient.findByPk(ingredientData.ingredientId);
      
      if (!ingredient) {
        throw new Error('Ingredient not found');
      }

      await recipe.addIngredient(
        ingredientData.ingredientId, 
        ingredientData.recipeQuantity,
        {
          recipeUnit: ingredientData.recipeUnit,
          isOptional: ingredientData.isOptional,
          notes: ingredientData.notes
        }
      );

      // Return updated recipe with ingredients
      const updatedRecipe = await Recipe.findByPk(recipeId, {
        include: [
          {
            model: Ingredient,
            as: 'ingredients', // Use the alias from associations
            through: { 
              attributes: ['recipeQuantity', 'recipeUnit', 'isOptional', 'notes']
            }
          }
        ]
      });

      return updatedRecipe.toJSON();
    } catch (error) {
      throw new Error(`Failed to add ingredient to recipe: ${error.message}`);
    }
  }

  // Remove ingredient from recipe
  async removeIngredientFromRecipe(recipeId, ingredientId) {
    try {
      const recipe = await Recipe.findByPk(recipeId);
      
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      const removed = await recipe.removeIngredient(ingredientId);
      
      if (removed === 0) {
        throw new Error('Ingredient not found in recipe');
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to remove ingredient from recipe: ${error.message}`);
    }
  }

  // Get recipe statistics
  async getRecipeStats() {
    try {
      const { fn, col } = require("sequelize");

      const stats = await Recipe.findOne({
        attributes: [
          [fn("COUNT", col("id")), "totalRecipes"],
          [fn("AVG", col("servings")), "averageServings"],
          [fn("MIN", col("servings")), "minServings"],
          [fn("MAX", col("servings")), "maxServings"],
        ],
        raw: true,
      });

      // Get ingredient usage stats
      const ingredientStats = await RecipeIngredient.findOne({
        attributes: [
          [fn("COUNT", fn("DISTINCT", col("ingredientId"))), "totalUniqueIngredients"],
          [fn("AVG", fn("COUNT", col("ingredientId"))), "avgIngredientsPerRecipe"]
        ],
        group: ['recipeId'],
        raw: true,
      });

      return {
        totalRecipes: parseInt(stats.totalRecipes) || 0,
        averageServings: parseFloat(stats.averageServings) || 0,
        minServings: parseInt(stats.minServings) || 0,
        maxServings: parseInt(stats.maxServings) || 0,
        totalUniqueIngredients: parseInt(ingredientStats?.totalUniqueIngredients) || 0,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve recipe statistics: ${error.message}`);
    }
  }

  // Get recipes that can be made with available ingredients
  async getRecipesWithAvailableIngredients(availableIngredientIds) {
    try {
      const recipes = await Recipe.findAll({
        include: [
          {
            model: Ingredient,
            as: 'ingredients', // Use the alias from associations
            through: { 
              attributes: ['recipeQuantity', 'recipeUnit', 'isOptional', 'notes']
            },
            required: true
          }
        ]
      });

      // Filter recipes where all required ingredients are available
      const makableRecipes = recipes.filter(recipe => {
        const requiredIngredients = recipe.ingredients.filter(ing => 
          !ing.RecipeIngredient.isOptional
        );
        
        return requiredIngredients.every(ingredient => 
          availableIngredientIds.includes(ingredient.id)
        );
      });

      return makableRecipes.map(recipe => recipe.toJSON());
    } catch (error) {
      throw new Error(`Failed to find makable recipes: ${error.message}`);
    }
  }

  // Bulk create recipes with ingredients (useful for seeding or imports)
  async bulkCreateRecipes(recipesData) {
    try {
      const createdRecipes = [];

      for (const data of recipesData) {
        const recipe = await this.createRecipe(data);
        createdRecipes.push(recipe);
      }

      return createdRecipes;
    } catch (error) {
      throw new Error(`Failed to bulk create recipes: ${error.message}`);
    }
  }
}

// Export a singleton instance
module.exports = new RecipeService();