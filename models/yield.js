'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Yield extends Model {
    static associate(models) {
      Yield.belongsTo(models.Animal, {
        foreignKey: 'animal_id',
        as: 'animal'
      });
    }
  }
  Yield.init({
    animal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'animals',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    unit_type: {
      type: DataTypes.ENUM('milk', 'egg'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Yield',
    tableName: 'yields',
    timestamps: true,
    underscored: true
  });

  return Yield;
};
