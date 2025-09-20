const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../integrations/db");

// Junction table for Recipe-Ingredient many-to-many relationship
class RecipeIngredient extends Model {}

RecipeIngredient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'recipes',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ingredients',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    // Recipe-specific ingredient properties
    recipeQuantity: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Quantity needed for this recipe (e.g., "2 cups", "1 tbsp")'
    },
    recipeUnit: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Unit for this recipe if different from ingredient base unit'
    },
    isOptional: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this ingredient is optional in the recipe'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Recipe-specific notes (e.g., "diced", "at room temperature")'
    }
  },
  {
    sequelize,
    modelName: "RecipeIngredient",
    tableName: "recipe_ingredients",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ['recipeId', 'ingredientId']
      },
      {
        fields: ['recipeId']
      },
      {
        fields: ['ingredientId']
      }
    ]
  }
);

module.exports = RecipeIngredient;