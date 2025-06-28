'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('Starting migration: Fix animal tag_number index');
      
      // Drop the existing unique index on tag_number
      await queryInterface.removeIndex('animals', 'tag_number_1');
      console.log('Dropped old tag_number unique index');
      
      // Create new compound unique index on tag_number and farm_id
      await queryInterface.addIndex('animals', ['tag_number', 'farm_id'], {
        unique: true,
        name: 'tag_number_farm_id_unique'
      });
      console.log('Created new compound unique index on tag_number and farm_id');
      
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Rolling back migration: Fix animal tag_number index');
      
      // Drop the compound index
      await queryInterface.removeIndex('animals', 'tag_number_farm_id_unique');
      console.log('Dropped compound unique index');
      
      // Recreate the old global unique index
      await queryInterface.addIndex('animals', ['tag_number'], {
        unique: true,
        name: 'tag_number_1'
      });
      console.log('Recreated old tag_number unique index');
      
      console.log('Rollback completed successfully');
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }
}; 