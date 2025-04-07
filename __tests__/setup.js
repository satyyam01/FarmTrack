const { sequelize } = require('../models');
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';

// Increase timeout for tests
jest.setTimeout(10000);

// Setup database before all tests
beforeAll(async () => {
  try {
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

// Clean up database after each test
afterEach(async () => {
  try {
    // Delete all records from all tables
    await sequelize.query('DELETE FROM return_logs');
    await sequelize.query('DELETE FROM notes');
    await sequelize.query('DELETE FROM checkups');
    await sequelize.query('DELETE FROM medications');
    await sequelize.query('DELETE FROM yields');
    await sequelize.query('DELETE FROM animals');
    await sequelize.query('DELETE FROM users');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    throw error;
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
});
