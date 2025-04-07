'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Medication extends Model {
    static associate(models) {
      Medication.belongsTo(models.Animal, {
        foreignKey: 'animal_id',
        as: 'animal'
      });
    }
  }
  Medication.init({
    animal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'animals',
        key: 'id'
      }
    },
    medicine_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isAfterStartDate(value) {
          if (value && value < this.start_date) {
            throw new Error('End date must be after start date');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Medication',
    tableName: 'medications',
    timestamps: true,
    underscored: true
  });

  return Medication;
};
