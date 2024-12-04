const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');

const Securite = sequelize.define('Securite', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateur_id: { type: DataTypes.INTEGER, references: { model: Utilisateur, key: 'id' }, allowNull: false },
  dernier_changement_mdp: { type: DataTypes.DATE },
  deux_facteurs_activé: { type: DataTypes.BOOLEAN },
  dernière_tentative_connexion: { type: DataTypes.DATE },
  tentative_connexion_echouée: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = Securite;
