'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, add the new column
    await queryInterface.addColumn('animals', 'is_producing_yield', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });

    // Then, remove the old column
    await queryInterface.removeColumn('animals', 'last_pregnancy');
  },

  down: async (queryInterface, Sequelize) => {
    // First, add back the old column
    await queryInterface.addColumn('animals', 'last_pregnancy', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Then, remove the new column
    await queryInterface.removeColumn('animals', 'is_producing_yield');
  }
}; 