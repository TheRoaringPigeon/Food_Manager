/**
 * Recipe Model with Sequelize ORM
 * Handles data structure, validation, and database operations
 * Now with proper ingredient associations
 */

const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../integrations/db");

class Recipe extends Model {
  toJSON() {
    const values = { ...this.get() };
    return values;
  }

  static validateData(data) {
    const errors = [];

    const stringFields = {
      name: "Name",
      cookTime: "Cook time",
      instructions: "Instructions",
    };

    for (const [field, label] of Object.entries(stringFields)) {
      if (data[field] !== undefined) {
        if (typeof data[field] !== "string" || data[field].trim() === "") {
          errors.push(`${label} is required and must be a non-empty string`);
        }
      }
    }

    if (data.servings !== undefined) {
      if (typeof data.servings !== "number" || data.servings <= 0) {
        errors.push("Servings must be a positive number");
      }
    }

    // Validate ingredients array if provided
    if (data.ingredients !== undefined) {
      if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
        errors.push("Ingredients must be a non-empty array");
      } else {
        data.ingredients.forEach((ingredient, index) => {
          if (typeof ingredient !== 'object' || ingredient === null) {
            errors.push(`Ingredient at index ${index} must be an object`);
          } else {
            if (!ingredient.ingredientId || typeof ingredient.ingredientId !== 'number') {
              errors.push(`Ingredient at index ${index} must have a valid ingredientId`);
            }
            if (!ingredient.recipeQuantity || typeof ingredient.recipeQuantity !== 'string' || ingredient.recipeQuantity.trim() === '') {
              errors.push(`Ingredient at index ${index} must have a valid recipeQuantity`);
            }
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static async createRecipe(data) {
    const validation = Recipe.validateData(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const transaction = await sequelize.transaction();
    
    try {
      const recipeData = {
        name: data.name.trim(),
        cookTime: data.cookTime.trim(),
        servings: data.servings,
        instructions: data.instructions.trim(),
      };

      const recipe = await Recipe.create(recipeData, { transaction });

      // Add ingredients if provided
      if (data.ingredients && data.ingredients.length > 0) {
        const RecipeIngredient = require('./RecipeIngredient');
        const ingredientData = data.ingredients.map(ingredient => ({
          recipeId: recipe.id,
          ingredientId: ingredient.ingredientId,
          recipeQuantity: ingredient.recipeQuantity.trim(),
          recipeUnit: ingredient.recipeUnit?.trim() || null,
          isOptional: ingredient.isOptional || false,
          notes: ingredient.notes?.trim() || null
        }));

        await RecipeIngredient.bulkCreate(ingredientData, { transaction });
      }

      await transaction.commit();
      return recipe;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async searchRecipes(query) {
    const { Op } = require("sequelize");
    const Ingredient = require('./Ingredient');
    const RecipeIngredient = require('./RecipeIngredient');
    const searchTerm = query.toLowerCase();

    const recipes = await Recipe.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${searchTerm}%`,
            },
          },
          {
            instructions: {
              [Op.iLike]: `%${searchTerm}%`,
            },
          },
        ],
      },
      include: [
        {
          model: Ingredient,
          as: 'ingredients', // Use the alias from associations
          through: { 
            attributes: ['recipeQuantity', 'recipeUnit', 'isOptional', 'notes']
          },
          where: {
            [Op.or]: [
              {
                name: {
                  [Op.iLike]: `%${searchTerm}%`,
                },
              },
              {
                category: {
                  [Op.iLike]: `%${searchTerm}%`,
                },
              },
            ],
          },
          required: false // LEFT JOIN to also get recipes without matching ingredients
        }
      ],
      order: [["name", "DESC"]],
    });

    return recipes;
  }

  static async getAllRecipes(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const Ingredient = require('./Ingredient');
    const RecipeIngredient = require('./RecipeIngredient');

    const { count, rows } = await Recipe.findAndCountAll({
      include: [
        {
          model: Ingredient,
          as: 'ingredients', // Use the alias from associations
          through: { 
            attributes: ['recipeQuantity', 'recipeUnit', 'isOptional', 'notes']
          }
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["name", "DESC"]],
      distinct: true, // Important for accurate count with includes
    });

    return {
      recipes: rows,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      hasNext: page * limit < count,
      hasPrev: page > 1,
    };
  }

  async updateRecipe(data) {
    const validation = Recipe.validateData(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const transaction = await sequelize.transaction();
    
    try {
      const updateData = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.cookTime !== undefined) updateData.cookTime = data.cookTime.trim();
      if (data.servings !== undefined) updateData.servings = data.servings;
      if (data.instructions !== undefined) updateData.instructions = data.instructions.trim();

      await this.update(updateData, { transaction });

      // Update ingredients if provided
      if (data.ingredients !== undefined) {
        const RecipeIngredient = require('./RecipeIngredient');
        
        // Remove existing ingredients
        await RecipeIngredient.destroy({
          where: { recipeId: this.id },
          transaction
        });

        // Add new ingredients
        if (data.ingredients.length > 0) {
          const ingredientData = data.ingredients.map(ingredient => ({
            recipeId: this.id,
            ingredientId: ingredient.ingredientId,
            recipeQuantity: ingredient.recipeQuantity.trim(),
            recipeUnit: ingredient.recipeUnit?.trim() || null,
            isOptional: ingredient.isOptional || false,
            notes: ingredient.notes?.trim() || null
          }));

          await RecipeIngredient.bulkCreate(ingredientData, { transaction });
        }
      }

      await transaction.commit();
      return this;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async addIngredient(ingredientId, recipeQuantity, options = {}) {
    const RecipeIngredient = require('./RecipeIngredient');
    
    return await RecipeIngredient.create({
      recipeId: this.id,
      ingredientId,
      recipeQuantity,
      recipeUnit: options.recipeUnit || null,
      isOptional: options.isOptional || false,
      notes: options.notes || null
    });
  }

  async removeIngredient(ingredientId) {
    const RecipeIngredient = require('./RecipeIngredient');
    
    return await RecipeIngredient.destroy({
      where: {
        recipeId: this.id,
        ingredientId
      }
    });
  }

  async getIngredientsWithDetails() {
    const Ingredient = require('./Ingredient');
    const RecipeIngredient = require('./RecipeIngredient');
    
    return await Ingredient.findAll({
      include: [{
        model: Recipe,
        where: { id: this.id },
        through: { 
          model: RecipeIngredient,
          attributes: ['recipeQuantity', 'recipeUnit', 'isOptional', 'notes']
        }
      }]
    });
  }
}

// Initialize the model with Sequelize (removed ingredients field)
Recipe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Recipe name cannot be empty",
        },
        len: {
          args: [1, 255],
          msg: "Recipe name must be between 1 and 255 characters",
        },
      },
    },
    cookTime: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "cook_time",
      validate: {
        notEmpty: {
          msg: "Cook time cannot be empty",
        },
      },
    },
    servings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: "Servings must be at least 1",
        },
        isInt: {
          msg: "Servings must be a whole number",
        },
      },
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Instructions cannot be empty",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "Recipe",
    tableName: "recipes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "recipes_name_idx",
        fields: ["name"],
      },
      {
        name: "recipes_servings_idx",
        fields: ["servings"],
      },
    ],
  }
);

module.exports = Recipe;