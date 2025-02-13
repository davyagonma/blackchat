const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile, desactivateAccount, getAllUsers, logoutUser, getUserProfileByEmail } = require('../controllers/userController');
const router = express.Router();

// Routes publiques
router.post('/register', registerUser);
router.post('/login', loginUser);

// Routes protégées
router.get('/:id', getUserProfile);
router.get('/', getUserProfileByEmail);

// Route pour récupérer tous les utilisateurs
router.get('/', getAllUsers);

// Route pour mettre à jour les informations personnelles
router.put('/users/:id', updateUserProfile);

// Route pour désactiver un compte utilisateur
router.put('/users/:id/desactivate', desactivateAccount);

// Route pour déconnexion 
router.post('/logout', logoutUser); 

module.exports = router;
