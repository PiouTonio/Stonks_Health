const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models'); // Importer sequelize depuis index.js
const userRoutes = require('./routes/user');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);

// Synchronisation des modèles
(async () => {
  try {
    await sequelize.sync({ alter: true }); // Synchroniser la base de données
    console.log('Base de données synchronisée.');
  } catch (error) {
    console.error('Erreur de synchronisation :', error);
  }
})();

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
