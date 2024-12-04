const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');

const SuiviDeSante = sequelize.define('SuiviDeSante', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateur_id: { type: DataTypes.INTEGER, references: { model: Utilisateur, key: 'id' }, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  poids: { type: DataTypes.FLOAT },
  pression_arterielle: { type: DataTypes.STRING },
  frequence_cardiaque: { type: DataTypes.INTEGER },
  autres_donnees: { type: DataTypes.JSON },
});

module.exports = SuiviDeSante;
