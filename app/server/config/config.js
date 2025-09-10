/**
 * Application Configuration
 * Centralized configuration management
 */

const config = {
    development: {
        port: process.env.PORT || 3000,
        nodeEnv: 'development',
        apiPrefix: '/api',
        cors: {
            origin: '*',
            credentials: true
        }
    },
    
    production: {
        port: process.env.PORT || 8080,
        nodeEnv: 'production',
        apiPrefix: '/api',
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
            credentials: true
        }
    },
    
    test: {
        port: process.env.PORT || 3001,
        nodeEnv: 'test',
        apiPrefix: '/api',
        cors: {
            origin: '*',
            credentials: true
        }
    }
};

const environment = process.env.NODE_ENV || 'development';

module.exports = config[environment];