/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err);

    // Default error
    let error = {
        success: false,
        message: 'Internal server error',
        ...(process.env.APP_ENV === 'development' && { stack: err.stack })
    };

    // Validation errors
    if (err.name === 'ValidationError') {
        error.message = err.message;
        return res.status(400).json(error);
    }

    // Cast errors (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
        error.message = 'Invalid ID format';
        return res.status(400).json(error);
    }

    // Duplicate key errors
    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        return res.status(400).json(error);
    }

    // Default to 500 server error
    res.status(err.statusCode || 500).json(error);
};

// 404 Not Found handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Request logger middleware
const requestLogger = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
};

module.exports = {
    errorHandler,
    notFound,
    requestLogger
};