const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');
const Medecin = require('./Medecin');

const RendezVous = sequelize.define('RendezVous', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateur_id: { type: DataTypes.INTEGER, references: { model: Utilisateur, key: 'id' }, allowNull: false },
  médecin_id: { type: DataTypes.INTEGER, references: { model: Medecin, key: 'id' }, allowNull: false },
  date_heure: { type: DataTypes.DATE, allowNull: false },
  statut: { type: DataTypes.ENUM('Confirmé', 'En attente', 'Annulé'), allowNull: false },
  commentaires: { type: DataTypes.TEXT },
});

module.exports = RendezVous;
