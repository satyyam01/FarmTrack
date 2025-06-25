'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is for MongoDB, not Sequelize
    // We'll handle this in the application code
    console.log('Migration: Converting yield dates from Date objects to strings');
    
    // This migration will be handled by the application startup
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    // Revert migration if needed
    return Promise.resolve();
  }
}; 