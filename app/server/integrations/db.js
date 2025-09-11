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
    
    // Sync all models
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

// Seed default data (optional)
const seedDefaultData = async () => {
  try {
    const Recipe = require('../models/Recipe');
    
    const defaultRecipes = [
      {
        name: "Spaghetti Carbonara",
        cookTime: "20 minutes",
        servings: 4,
        ingredients: ["spaghetti", "eggs", "bacon", "parmesan", "black pepper"],
        instructions: "1. Cook pasta according to package directions. 2. Fry bacon until crispy. 3. Whisk eggs and cheese. 4. Combine all ingredients off heat."
      },
      {
        name: "Chicken Stir Fry",
        cookTime: "15 minutes",
        servings: 3,
        ingredients: ["chicken breast", "broccoli", "bell peppers", "soy sauce", "garlic", "ginger"],
        instructions: "1. Cut chicken into strips. 2. Heat oil in wok. 3. Cook chicken until done. 4. Add vegetables and stir fry. 5. Add sauce and serve."
      },
      {
        name: "Chocolate Chip Cookies",
        cookTime: "12 minutes",
        servings: 24,
        ingredients: ["flour", "butter", "sugar", "brown sugar", "eggs", "vanilla", "chocolate chips"],
        instructions: "1. Cream butter and sugars. 2. Add eggs and vanilla. 3. Mix in flour. 4. Fold in chocolate chips. 5. Bake at 375°F."
      }
    ];

    await Recipe.bulkCreate(defaultRecipes);
    console.log('🌱 Default recipe data seeded successfully.');
    
  } catch (error) {
    console.error('❌ Error seeding default data:', error.message);
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