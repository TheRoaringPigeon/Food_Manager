/**
 * Database Reset Script
 * Drops all tables and recreates them with seed data
 */

require('dotenv').config();
const { initializeDatabase, testConnection, closeConnection } = require('../integrations/db');
const readline = require('readline');

function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function resetDatabase() {
  console.log('⚠️  DATABASE RESET WARNING');
  console.log('This will DROP ALL TABLES and recreate them with seed data.');
  console.log('ALL EXISTING DATA WILL BE LOST!');
  
  const confirmed = await askConfirmation('\nAre you sure you want to continue? (y/N): ');
  
  if (!confirmed) {
    console.log('❌ Reset cancelled.');
    process.exit(0);
  }

  console.log('🔄 Starting database reset...');
  
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    // Reset database (force = true drops all tables)
    await initializeDatabase(true);
    
    console.log('✅ Database reset completed successfully!');
    console.log('🌱 Default seed data has been inserted.');
    
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

// Run reset if called directly
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };