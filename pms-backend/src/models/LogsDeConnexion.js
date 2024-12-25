const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');

const LogsDeConnexion = sequelize.define('LogsDeConnexion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateur_id: { type: DataTypes.INTEGER, references: { model: Utilisateur, key: 'id' }, allowNull: false },
  date_connexion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  adresse_ip: { type: DataTypes.STRING },
  succès: { type: DataTypes.BOOLEAN, allowNull: false },
});

module.exports = LogsDeConnexion;
