const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilisateur = sequelize.define('Utilisateur', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  prenom: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  telephone: { type: DataTypes.INTEGER, unique: true, allowNull: false},
  mot_de_passe: { type: DataTypes.STRING, allowNull: false },
  date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  role: { type: DataTypes.ENUM('Utilisateur', 'Médecin'), allowNull: false },
});

module.exports = Utilisateur;
