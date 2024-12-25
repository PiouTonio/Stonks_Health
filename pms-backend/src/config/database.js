const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // Nom de la base
  process.env.DB_USER, // Utilisateur
  process.env.DB_PASSWORD, // Mot de passe
  {
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    logging: false, // Désactiver les logs SQL
  }
);

module.exports = sequelize;
