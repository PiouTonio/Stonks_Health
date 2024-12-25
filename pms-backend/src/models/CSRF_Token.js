const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');

const CSRF_Token = sequelize.define('CSRF_Token', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateur_id: { type: DataTypes.INTEGER, references: { model: Utilisateur, key: 'id' }, allowNull: false },
  token: { type: DataTypes.STRING, allowNull: false },
  expiration: { type: DataTypes.DATE },
});

module.exports = CSRF_Token;
