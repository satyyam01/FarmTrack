'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    static associate(models) {
      Note.belongsTo(models.Animal, {
        foreignKey: 'animal_id',
        as: 'animal'
      });
    }
  }
  Note.init({
    animal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'animals',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Note',
    tableName: 'notes',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Note;
};
