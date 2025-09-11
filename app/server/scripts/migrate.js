/**
 * Database Migration Script
 * Creates tables and syncs models
 */

require('dotenv').config();
const { initializeDatabase, testConnection, closeConnection } = require('../integrations/db');

async function migrate() {
  console.log('🔄 Starting database migration...');
  
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    // Run migration
    await initializeDatabase(false); // false = don't drop existing tables
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
}

module.exports = { migrate };