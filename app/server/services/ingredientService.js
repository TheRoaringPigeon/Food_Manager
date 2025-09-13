/**
 * Ingredient Service - Updated for PostgreSQL with Sequelize ORM
 * Contains business logic for ingredient operations
 */

const Ingredient = require("../models/Ingredient");
const { Op } = require("sequelize");

class IngredientService {
  // Get all ingredients with optional pagination
  async getAllIngredients(page = 1, limit = 10) {
    try {
      const result = await Ingredient.getAllIngredients(page, limit);

      // Convert ingredients to JSON format
      const ingredients = result.ingredients.map((ingredient) => ingredient.toJSON());
      return {
        ingredients,
        pagination: {
          totalCount: result.totalCount,
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      };
    } catch (error) {
      throw new Error(`Failed to retrieve ingredients: ${error.message}`);
    }
  }

  // Get ingredient by ID
  async getIngredientById(id) {
    try {
      const ingredient = await Ingredient.findByPk(id);
      return ingredient ? ingredient.toJSON() : null;
    } catch (error) {
      throw new Error(`Failed to retrieve ingredient: ${error.message}`);
    }
  }

  // Create new ingredient
  async createIngredient(data) {
    try {
      const ingredient = await Ingredient.createIngredient(data);
      return ingredient.toJSON();
    } catch (error) {
      // Handle Sequelize validation errors
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((err) => err.message);
        throw new Error(validationErrors.join(", "));
      }
      throw new Error(error.message);
    }
  }

  // Update ingredient
  async updateIngredient(id, data) {
    try {
      const ingredient = await Ingredient.findByPk(id);

      if (!ingredient) {
        return null;
      }

      await ingredient.updateIngredient(data);
      return ingredient.toJSON();
    } catch (error) {
      // Handle Sequelize validation errors
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((err) => err.message);
        throw new Error(validationErrors.join(", "));
      }
      throw new Error(error.message);
    }
  }

  // Delete ingredient
  async deleteIngredient(id) {
    try {
      const ingredient = await Ingredient.findByPk(id);

      if (!ingredient) {
        return false;
      }

      await ingredient.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete ingredient: ${error.message}`);
    }
  }

  // Search ingredients
  async searchIngredients(query) {
    try {
      const ingredients = await Ingredient.searchIngredients(query);
      return ingredients.map((ingredient) => ingredient.toJSON());
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  // Get ingredients by servings range
  async getIngredientsByServings(minServings, maxServings) {
    try {
      const ingredients = await Ingredient.findAll({
        where: {
          servings: {
            [Op.between]: [minServings, maxServings],
          },
        },
        order: [["servings", "ASC"]],
      });

      return ingredients.map((ingredient) => ingredient.toJSON());
    } catch (error) {
      throw new Error(
        `Failed to retrieve ingredients by servings: ${error.message}`
      );
    }
  }

  // Get ingredients by ingredient
  async getIngredientsByIngredient(ingredient) {
    try {
      const ingredients = await Ingredient.findAll({
        where: {
          ingredients: {
            [Op.iLike]: `%${ingredient.toLowerCase()}%`,
          },
        },
        order: [["name", "ASC"]],
      });

      return ingredients.map((ingredient) => ingredient.toJSON());
    } catch (error) {
      throw new Error(
        `Failed to retrieve ingredients by ingredient: ${error.message}`
      );
    }
  }

  // Get ingredient statistics
  async getIngredientStats() {
    try {
      const { fn, col } = require("sequelize");

      const stats = await Ingredient.findOne({
        attributes: [
          [fn("COUNT", col("id")), "totalIngredients"],
          [fn("AVG", col("servings")), "averageServings"],
          [fn("MIN", col("servings")), "minServings"],
          [fn("MAX", col("servings")), "maxServings"],
        ],
        raw: true,
      });

      return {
        totalIngredients: parseInt(stats.totalIngredients) || 0,
        averageServings: parseFloat(stats.averageServings) || 0,
        minServings: parseInt(stats.minServings) || 0,
        maxServings: parseInt(stats.maxServings) || 0,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve ingredient statistics: ${error.message}`);
    }
  }

  // Bulk create ingredients (useful for seeding or imports)
  async bulkCreateIngredients(ingredientsData) {
    try {
      // Validate all ingredients first
      for (const data of ingredientsData) {
        const validation = Ingredient.validateData(data);
        if (!validation.isValid) {
          throw new Error(
            `Invalid ingredient data: ${validation.errors.join(", ")}`
          );
        }
      }

      // Prepare data for bulk creation
      const preparedData = ingredientsData.map((data) => ({
        name: data.name.trim(),
        cookTime: data.cookTime.trim(),
        servings: data.servings,
        ingredients: JSON.stringify(data.ingredients.map((i) => i.trim())),
        instructions: data.instructions.trim(),
      }));

      const ingredients = await Ingredient.bulkCreate(preparedData, {
        returning: true,
      });

      return ingredients.map((ingredient) => ingredient.toJSON());
    } catch (error) {
      throw new Error(`Failed to bulk create ingredients: ${error.message}`);
    }
  }
}

// Export a singleton instance
module.exports = new IngredientService();
