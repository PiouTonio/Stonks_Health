const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');

const AnalyseEtRapport = sequelize.define('AnalyseEtRapport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateur_id: { type: DataTypes.INTEGER, references: { model: Utilisateur, key: 'id' }, allowNull: false },
  type: { type: DataTypes.STRING },
  contenu: { type: DataTypes.JSON },
});

module.exports = AnalyseEtRapport;
