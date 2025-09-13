/**
 * Main Server File - Updated to match your structure with PostgreSQL integration
 * Sets up Express server with PostgreSQL and Sequelize ORM
 */
const { swaggerUi, specs } = require('./server/integrations/swagger');
const express = require('express');
const path = require('path');
require('dotenv').config();

const { testConnection, initializeDatabase, closeConnection } = require('./server/integrations/db');

const app = express();
const PORT = process.env.PORT || 5000;
const ENV = process.env.APP_ENV || 'development';

// Middleware
app.use(express.json());

// Routes
const recipeRoutes = require('./server/routes/recipeRoutes');
const ingredientRoutes = require('./server/routes/ingredientRoutes');
app.use('/api', recipeRoutes);
app.use('/api', ingredientRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Recipe API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: ENV,
    database: 'PostgreSQL with Sequelize ORM'
  });
});

// Frontend serving
if (ENV === 'production') {
    // Serve built frontend (e.g., from Vite build)
    app.use(express.static(path.join(__dirname, 'dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
} else {
    // Serve raw client files during development
    app.use(express.static(path.join(__dirname, 'client')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'index.html'));
    });
}

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: ENV === 'development' ? err.message : 'Internal server error',
    ...(ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  
  try {
    await closeConnection();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  
  try {
    await closeConnection();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

// Start server with database initialization
async function startServer() {
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    let dbConnected = await testConnection();
    while (!dbConnected) {
      console.error('❌ Failed to connect to database. Retrying in 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      dbConnected = await testConnection();
    }

    // Initialize database (sync models)
    console.log('🔄 Initializing database...');
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('❌ Failed to initialize database. Exiting...');
      process.exit(1);
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🍳 Recipe API server running at http://localhost:${PORT}`);
      console.log(`📖 API endpoints available at http://localhost:${PORT}/api/recipes`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Database: PostgreSQL with Sequelize ORM`);
      console.log(`🌍 Environment: ${ENV}`);
      
      if (ENV === 'development') {
        console.log(`🎨 Frontend: http://localhost:${PORT}/`);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// 🚀 Start the server
startServer();

module.exports = app;