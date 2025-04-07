'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Checkup extends Model {
    static associate(models) {
      Checkup.belongsTo(models.Animal, {
        foreignKey: 'animal_id',
        as: 'animal'
      });
    }
  }
  Checkup.init({
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
    vet_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Checkup',
    tableName: 'checkups',
    timestamps: true,
    underscored: true
  });

  return Checkup;
};
