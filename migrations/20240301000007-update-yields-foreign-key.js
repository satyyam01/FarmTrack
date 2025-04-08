'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable foreign key support in SQLite
    await queryInterface.sequelize.query('PRAGMA foreign_keys = ON;');

    // Create a new yields table with CASCADE delete behavior
    await queryInterface.createTable('yields_new', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      animal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'animals',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unit_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Copy data from old table to new table
    await queryInterface.sequelize.query('INSERT INTO yields_new SELECT * FROM yields;');

    // Drop old table
    await queryInterface.dropTable('yields');

    // Rename new table to original name
    await queryInterface.renameTable('yields_new', 'yields');
  },

  async down(queryInterface, Sequelize) {
    // This is a one-way migration - we don't need to revert the CASCADE behavior
    console.log('This migration cannot be reverted safely');
  }
}; 