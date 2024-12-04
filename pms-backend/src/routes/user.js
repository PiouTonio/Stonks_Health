const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
require('dotenv').config();

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
    try {
      const { nom, email, mot_de_passe, role } = req.body;
  
      // Vérifier si le rôle est valide
      if (!['Utilisateur', 'Médecin'].includes(role)) {
        return res.status(400).json({ message: 'Rôle invalide. Choisissez Utilisateur ou Médecin.' });
      }
  
      // Vérifiez si l'email est déjà utilisé
      const existingUser = await Utilisateur.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email déjà utilisé.' });
      }
  
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
  
      // Créer l'utilisateur
      const user = await Utilisateur.create({ nom, email, mot_de_passe: hashedPassword, role });
  
      // Si le rôle est Médecin, créer l'entrée dans la table Médecin
      if (role === 'Médecin') {
        await Medecin.create({ utilisateur_id: user.id });
      }
  
      res.status(201).json({ message: 'Utilisateur créé avec succès.', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur.', error });
    }
  });
  
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await Utilisateur.findByPk(id, {
        include: [
          { model: Medecin }, // Inclure les détails du médecin, si existants
        ],
      });
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur.', error });
    }
  });

// Connexion
router.post('/login', async (req, res) => {
    try {
      const { email, mot_de_passe } = req.body;
  
      // Trouver l'utilisateur par email
      const user = await Utilisateur.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }
  
      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mot de passe incorrect.' });
      }
  
      // Générer le token JWT
      const token = jwt.sign(
        { id: user.id, role: user.role }, // Inclure le rôle dans le token
        process.env.SECRET_KEY,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ message: 'Connexion réussie.', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur.', error });
    }
  });
  
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
      const { role } = req.user; // Supposons que l'utilisateur est extrait du token JWT
  
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: 'Accès interdit.' });
      }
  
      next();
    };
};
  
router.get('/medecins', checkRole(['Médecin']), async (req, res) => {
    try {
      const medecins = await Medecin.findAll();
      res.status(200).json(medecins);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur.', error });
    }
  });
  
router.get('/:id/rendezvous', async (req, res) => {
    try {
      const { id } = req.params;
  
      const rendezvous = await RendezVous.findAll({
        where: { utilisateur_id: id },
        include: [
          { model: Medecin, include: [Utilisateur] }, // Inclure les détails du médecin
        ],
      });
  
      res.status(200).json(rendezvous);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur.', error });
    }
  });
  

module.exports = router;
