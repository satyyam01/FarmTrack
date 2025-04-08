'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable foreign key support in SQLite
    await queryInterface.sequelize.query('PRAGMA foreign_keys = ON;');

    // Create new tables with CASCADE delete behavior
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

    await queryInterface.createTable('medications_new', {
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
      medicine_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dosage: {
        type: Sequelize.STRING,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
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

    await queryInterface.createTable('checkups_new', {
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
      vet_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.createTable('notes_new', {
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
      content: {
        type: Sequelize.TEXT,
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

    await queryInterface.createTable('return_logs_new', {
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
      returned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      return_reason: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Copy data from old tables to new tables
    await queryInterface.sequelize.query('INSERT INTO yields_new SELECT * FROM yields;');
    await queryInterface.sequelize.query('INSERT INTO medications_new SELECT * FROM medications;');
    await queryInterface.sequelize.query('INSERT INTO checkups_new SELECT * FROM checkups;');
    await queryInterface.sequelize.query('INSERT INTO notes_new SELECT * FROM notes;');
    await queryInterface.sequelize.query('INSERT INTO return_logs_new SELECT * FROM return_logs;');

    // Drop old tables
    await queryInterface.dropTable('yields');
    await queryInterface.dropTable('medications');
    await queryInterface.dropTable('checkups');
    await queryInterface.dropTable('notes');
    await queryInterface.dropTable('return_logs');

    // Rename new tables to original names
    await queryInterface.renameTable('yields_new', 'yields');
    await queryInterface.renameTable('medications_new', 'medications');
    await queryInterface.renameTable('checkups_new', 'checkups');
    await queryInterface.renameTable('notes_new', 'notes');
    await queryInterface.renameTable('return_logs_new', 'return_logs');
  },

  async down(queryInterface, Sequelize) {
    // This is a one-way migration - we don't need to revert the CASCADE behavior
    // as it would be dangerous to remove it while data exists
    console.log('This migration cannot be reverted safely');
  }
}; 