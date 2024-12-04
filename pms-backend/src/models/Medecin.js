const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');

const Medecin = sequelize.define('Medecin', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateur_id: { type: DataTypes.INTEGER, references: { model: Utilisateur, key: 'id' }, allowNull: false },
  spécialité: { type: DataTypes.STRING, allowNull: false },
  numéro_de_téléphone: { type: DataTypes.STRING },
  adresse: { type: DataTypes.TEXT },
});

module.exports = Medecin;
