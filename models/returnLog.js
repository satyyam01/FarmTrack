'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReturnLog extends Model {
    static associate(models) {
      ReturnLog.belongsTo(models.Animal, {
        foreignKey: 'animal_id',
        as: 'animal'
      });
    }
  }
  ReturnLog.init({
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
    returned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    return_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ReturnLog',
    tableName: 'return_logs',
    timestamps: true,
    underscored: true
  });

  return ReturnLog;
};
