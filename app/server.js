const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ENV = process.env.APP_ENVIRONMENT || 'development';

// Middleware
app.use(express.json());

// Routes
const recipeRoutes = require('./server/routes/recipeRoutes');
app.use('/api', recipeRoutes);

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

// 🚀 Start the server
app.listen(PORT, () => {
    console.log(`🍳 Recipe API server running at http://localhost:${PORT}`);
    console.log(`📖 API endpoints available at http://localhost:${PORT}/api/recipes`);
});
