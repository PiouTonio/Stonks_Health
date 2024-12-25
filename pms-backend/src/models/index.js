const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');
const Medecin = require('./Medecin');
const RendezVous = require('./RendezVous');
const SuiviDeSante = require('./SuiviDeSante');
const AnalyseEtRapport = require('./AnalyseEtRapport');
const LogsDeConnexion = require('./LogsDeConnexion');
const Securite = require('./Securite');
const CSRF_Token = require('./CSRF_Token');

// Configurer les relations entre les modèles
Utilisateur.hasOne(Medecin, { foreignKey: 'utilisateur_id' });
Medecin.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

Utilisateur.hasMany(RendezVous, { foreignKey: 'utilisateur_id' });
RendezVous.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });
RendezVous.belongsTo(Medecin, { foreignKey: 'médecin_id' });

Utilisateur.hasMany(SuiviDeSante, { foreignKey: 'utilisateur_id' });
Utilisateur.hasMany(AnalyseEtRapport, { foreignKey: 'utilisateur_id' });
Utilisateur.hasMany(LogsDeConnexion, { foreignKey: 'utilisateur_id' });
Utilisateur.hasOne(Securite, { foreignKey: 'utilisateur_id' });
Utilisateur.hasMany(CSRF_Token, { foreignKey: 'utilisateur_id' });

module.exports = {
  sequelize,
  Utilisateur,
  Medecin,
  RendezVous,
  SuiviDeSante,
  AnalyseEtRapport,
  LogsDeConnexion,
  Securite,
  CSRF_Token,
};
