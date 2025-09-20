/**
 * Database Configuration and Connection
 * Sets up PostgreSQL connection using Sequelize ORM
 */

const { Sequelize } = require('sequelize');

// Database configuration
const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'recipes_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.APP_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME_TEST || 'recipes_db_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
};

const env = process.env.APP_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions || {}
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
};

// Initialize database (sync models)
const initializeDatabase = async (force = false) => {
  try {
    // Import models here to avoid circular dependencies
    const Recipe = require('../models/Recipe');
    const Ingredient = require('../models/Ingredient');
    const RecipeIngredient = require('../models/RecipeIngredient');
    
    // Import and set up associations
    require('../models/associations');

    // Sync all models in the correct order
    // First sync the base models, then the junction table
    await sequelize.sync({ force });
    
    if (force) {
      console.log('🔄 Database tables have been recreated.');
    } else {
      console.log('✅ Database tables have been synchronized.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    return false;
  }
};

// Updated seed function for the new model structure
const seedDefaultData = async () => {
  try {
    const Recipe = require('../models/Recipe');
    const Ingredient = require('../models/Ingredient');
    const RecipeIngredient = require('../models/RecipeIngredient');

    // First, seed some ingredients
    const defaultIngredients = [
      { name: "Spaghetti", category: "Pasta", quantity: "1", unit: "lb", expiryDate: "2025-12-31", location: "Pantry" },
      { name: "Eggs", category: "Dairy", quantity: "12", unit: "pieces", expiryDate: "2025-10-15", location: "Refrigerator" },
      { name: "Bacon", category: "Meat", quantity: "1", unit: "lb", expiryDate: "2025-10-01", location: "Refrigerator" },
      { name: "Parmesan Cheese", category: "Dairy", quantity: "8", unit: "oz", expiryDate: "2025-11-01", location: "Refrigerator" },
      { name: "Black Pepper", category: "Spice", quantity: "2", unit: "oz", expiryDate: "2026-01-01", location: "Spice Rack" },
      { name: "Chicken Breast", category: "Meat", quantity: "2", unit: "lbs", expiryDate: "2025-09-25", location: "Freezer" },
      { name: "Broccoli", category: "Vegetable", quantity: "1", unit: "head", expiryDate: "2025-09-28", location: "Refrigerator" },
      { name: "Bell Peppers", category: "Vegetable", quantity: "3", unit: "pieces", expiryDate: "2025-09-30", location: "Refrigerator" },
      { name: "Soy Sauce", category: "Condiment", quantity: "10", unit: "fl oz", expiryDate: "2026-06-01", location: "Pantry" },
      { name: "Garlic", category: "Vegetable", quantity: "1", unit: "bulb", expiryDate: "2025-10-15", location: "Pantry" },
      { name: "All-Purpose Flour", category: "Baking", quantity: "5", unit: "lbs", expiryDate: "2026-03-01", location: "Pantry" },
      { name: "Butter", category: "Dairy", quantity: "1", unit: "lb", expiryDate: "2025-10-30", location: "Refrigerator" },
      { name: "White Sugar", category: "Baking", quantity: "4", unit: "lbs", expiryDate: "2027-01-01", location: "Pantry" },
      { name: "Brown Sugar", category: "Baking", quantity: "2", unit: "lbs", expiryDate: "2026-08-01", location: "Pantry" },
      { name: "Chocolate Chips", category: "Baking", quantity: "12", unit: "oz", expiryDate: "2026-02-01", location: "Pantry" }
    ];

    const ingredients = await Ingredient.bulkCreate(defaultIngredients);
    console.log('🥕 Default ingredient data seeded successfully.');

    // Then seed recipes without ingredients first
    const defaultRecipes = [
      {
        name: "Spaghetti Carbonara",
        cookTime: "20 minutes",
        servings: 4,
        instructions: "1. Cook pasta according to package directions. 2. Fry bacon until crispy. 3. Whisk eggs and cheese. 4. Combine all ingredients off heat."
      },
      {
        name: "Chicken Stir Fry",
        cookTime: "15 minutes",
        servings: 3,
        instructions: "1. Cut chicken into strips. 2. Heat oil in wok. 3. Cook chicken until done. 4. Add vegetables and stir fry. 5. Add sauce and serve."
      },
      {
        name: "Chocolate Chip Cookies",
        cookTime: "12 minutes",
        servings: 24,
        instructions: "1. Cream butter and sugars. 2. Add eggs and vanilla. 3. Mix in flour. 4. Fold in chocolate chips. 5. Bake at 375°F."
      }
    ];

    const recipes = await Recipe.bulkCreate(defaultRecipes);
    console.log('🍝 Default recipe data seeded successfully.');

    // Now create the recipe-ingredient relationships
    const recipeIngredients = [
      // Spaghetti Carbonara (recipe ID 1)
      { recipeId: recipes[0].id, ingredientId: ingredients[0].id, recipeQuantity: "1 lb", recipeUnit: "lb" },
      { recipeId: recipes[0].id, ingredientId: ingredients[1].id, recipeQuantity: "3 large", recipeUnit: "pieces" },
      { recipeId: recipes[0].id, ingredientId: ingredients[2].id, recipeQuantity: "6 oz", recipeUnit: "oz" },
      { recipeId: recipes[0].id, ingredientId: ingredients[3].id, recipeQuantity: "1 cup", recipeUnit: "cup", notes: "grated" },
      { recipeId: recipes[0].id, ingredientId: ingredients[4].id, recipeQuantity: "1 tsp", recipeUnit: "tsp", notes: "freshly ground" },

      // Chicken Stir Fry (recipe ID 2)  
      { recipeId: recipes[1].id, ingredientId: ingredients[5].id, recipeQuantity: "1 lb", recipeUnit: "lb", notes: "cut into strips" },
      { recipeId: recipes[1].id, ingredientId: ingredients[6].id, recipeQuantity: "2 cups", recipeUnit: "cups", notes: "cut into florets" },
      { recipeId: recipes[1].id, ingredientId: ingredients[7].id, recipeQuantity: "2 medium", recipeUnit: "pieces", notes: "sliced" },
      { recipeId: recipes[1].id, ingredientId: ingredients[8].id, recipeQuantity: "3 tbsp", recipeUnit: "tbsp" },
      { recipeId: recipes[1].id, ingredientId: ingredients[9].id, recipeQuantity: "3 cloves", recipeUnit: "cloves", notes: "minced" },

      // Chocolate Chip Cookies (recipe ID 3)
      { recipeId: recipes[2].id, ingredientId: ingredients[10].id, recipeQuantity: "2 1/4 cups", recipeUnit: "cups" },
      { recipeId: recipes[2].id, ingredientId: ingredients[11].id, recipeQuantity: "1 cup", recipeUnit: "cup", notes: "softened" },
      { recipeId: recipes[2].id, ingredientId: ingredients[12].id, recipeQuantity: "3/4 cup", recipeUnit: "cup" },
      { recipeId: recipes[2].id, ingredientId: ingredients[13].id, recipeQuantity: "3/4 cup", recipeUnit: "cup", notes: "packed" },
      { recipeId: recipes[2].id, ingredientId: ingredients[1].id, recipeQuantity: "2 large", recipeUnit: "pieces" },
      { recipeId: recipes[2].id, ingredientId: ingredients[14].id, recipeQuantity: "2 cups", recipeUnit: "cups" }
    ];

    await RecipeIngredient.bulkCreate(recipeIngredients);
    console.log('🔗 Recipe-ingredient relationships seeded successfully.');
    
  } catch (error) {
    console.error('❌ Error seeding default data:', error.message);
    console.error(error);
  }
};

// Graceful shutdown
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase,
  closeConnection,
  seedDefaultData,
  Sequelize
};