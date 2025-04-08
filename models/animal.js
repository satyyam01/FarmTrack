'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Animal extends Model {
    static associate(models) {
      // Define associations here
      Animal.hasMany(models.Yield, { 
        foreignKey: 'animal_id', 
        as: 'yields',
        onDelete: 'CASCADE'
      });
      Animal.hasMany(models.ReturnLog, { 
        foreignKey: 'animal_id', 
        as: 'return_logs',
        onDelete: 'CASCADE'
      });
      Animal.hasMany(models.Medication, { 
        foreignKey: 'animal_id', 
        as: 'medications',
        onDelete: 'CASCADE'
      });
      Animal.hasMany(models.Checkup, { 
        foreignKey: 'animal_id', 
        as: 'checkups',
        onDelete: 'CASCADE'
      });
    }
  }
  Animal.init({
    tag_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM('Cow', 'Hen', 'Horse', 'Sheep', 'Goat'),
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female'),
      allowNull: false
    },
    is_producing_yield: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Animal',
    tableName: 'animals',
    timestamps: true,
    underscored: true
  });

  return Animal;
};
