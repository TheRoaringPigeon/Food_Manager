const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../integrations/db");

class Ingredient extends Model {
  toJSON() {
    const values = { ...this.get() };
  }

  static validateData(data) {
    const errors = [];

    const fieldsToValidate = {
      name: "Name",
      category: "Category",
      quantity: "Quantity",
      unit: "Unit",
      expiryDate: "ExpiryDate",
      location: "Location",
    };

    for (const [field, fieldLabel] of Object.entries(fieldsToValidate)) {
      if (data[field] !== undefined) {
        if (typeof data[field] !== "string" || data[field].trim() === "") {
          errors.push(
            `${fieldLabel} is required and must be a non-empty string`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static async createIngredient(data) {
    const validation = Ingredient.validateData(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const ingredientData = {
      name: data.name.trim(),
      category: data.category.trim(),
      quantity: data.quantity.trim(),
      unit: data.unit.trim(),
      expiryDate: data.expiryDate.trim(),
      location: data.location.trim(),
    };

    const ingredient = await Ingredient.create(ingredientData);
    return ingredient;
  }

  static async searchIngredients(query) {
    const { Op } = require("sequelize");
    const searchTerm = query.toLowerCase();

    const ingredients = await Ingredient.findAll({
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
          {
            expiryDate: {
              [Op.iLike]: `%${searchTerm}%`,
            },
          },
        ],
      },
      order: [["name", "DESC"]],
    });

    return ingredients;
  }

  static async getAllIngredients(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Ingredient.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["name", "DESC"]],
    });

    return {
      ingredients: rows,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      hasNext: page * limit < count,
      hasPrev: page > 1,
    };
  }

  async updateIngredient(data) {
    const validation = Ingredient.validateData(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.category !== undefined) updateData.category = data.category.trim();
    if (data.quantity !== undefined) updateData.quantity = data.quantity.trim();
    if (data.unit !== undefined) updateData.unit = data.unit.trim();
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate.trim();
    if (data.location !== undefined) updateData.location = data.location.trim();

    await this.update(updateData);
    return this;
  }
}

Ingredient.init();

module.exports = Ingredient;
