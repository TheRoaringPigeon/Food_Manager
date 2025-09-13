/**
 * Recipe Model with Sequelize ORM
 * Handles data structure, validation, and database operations
 */

const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../integrations/db");

class Recipe extends Model {
  toJSON() {
    const values = { ...this.get() };
    if (typeof values.ingredients === "string") {
      try {
        values.ingredients = JSON.parse(values.ingredients);
      } catch (error) {
        values.ingredients = [];
      }
    }
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

    if (data.ingredients !== undefined) {
      if (
        !Array.isArray(data.ingredients) ||
        data.ingredients.length === 0 ||
        !data.ingredients.every((i) => typeof i === "string" && i.trim() !== "")
      ) {
        errors.push(
          "Ingredients must be a non-empty array of non-empty strings"
        );
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

    const recipeData = {
      name: data.name.trim(),
      cookTime: data.cookTime.trim(),
      servings: data.servings,
      ingredients: JSON.stringify(data.ingredients.map((i) => i.trim())),
      instructions: data.instructions.trim(),
    };

    const recipe = await Recipe.create(recipeData);
    return recipe;
  }

  static async searchRecipes(query) {
    const { Op } = require("sequelize");
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
          {
            ingredients: {
              [Op.iLike]: `%${searchTerm}%`,
            },
          },
        ],
      },
      order: [["name", "DESC"]],
    });

    return recipes;
  }

  static async getAllRecipes(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Recipe.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["name", "DESC"]],
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

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.cookTime !== undefined) updateData.cookTime = data.cookTime.trim();
    if (data.servings !== undefined) updateData.servings = data.servings;
    if (data.ingredients !== undefined) {
      updateData.ingredients = JSON.stringify(
        data.ingredients.map((i) => i.trim())
      );
    }
    if (data.instructions !== undefined)
      updateData.instructions = data.instructions.trim();

    await this.update(updateData);
    return this;
  }
}

// Initialize the model with Sequelize
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
    ingredients: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Ingredients cannot be empty",
        },
        isValidJSON(value) {
          try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed) || parsed.length === 0) {
              throw new Error("Ingredients must be a non-empty array");
            }
          } catch (error) {
            throw new Error("Ingredients must be valid JSON array");
          }
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
