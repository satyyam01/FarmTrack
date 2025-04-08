'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('return_logs', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      returned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add index for faster queries
    await queryInterface.addIndex('return_logs', ['animal_id']);
    await queryInterface.addIndex('return_logs', ['date']);
    await queryInterface.addIndex('return_logs', ['animal_id', 'date'], {
      unique: true,
      name: 'return_logs_animal_date_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('return_logs');
  }
}; 