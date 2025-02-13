const User = require('../models/userModel');
const EmailService = require('../services/emailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription
exports.registerUser = async (req, res) => {
  const { fullname, email, username, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const newUser = new User({ fullname, email, username, password });
    await newUser.save();

    // Générer un token de vérification
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Appeler le service d'email
    await EmailService.sendVerificationEmail(newUser, token);

    res.status(201).json({ message: 'Utilisateur créé avec succès. Email de vérification envoyé.' });
    //res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Connexion
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupération d'un utilisateur
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserProfileByEmail = async (req, res) => {
  try {
      const { email } = req.query; // Récupère l'email depuis les paramètres de requête

      // Vérifie si l'email est fourni
      if (!email) {
          return res.status(400).json({ success: false, message: "Email is required" });
      }

      // Recherche l'utilisateur dans la base de données
      const user = await User.findOne({ email });

      // Si l'utilisateur n'est pas trouvé
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      // Renvoie les informations de l'utilisateur
      res.status(200).json({ success: true, user });
  } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find(); // Récupère tous les utilisateurs
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// Déconnexion
exports.logoutUser = (req, res) => {
    try {
      // Vérifier si un token est présent dans le header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(200).json({ message: "L'utilisateur n'est pas connecté."});
      }

      // Supprimer le token (optionnel car les headers sont immuables, mais informer le client)
      req.headers.authorization = null; // Indiquer que le token est supprimé côté serveur

      res.status(200).json({
        message: 'Déconnexion réussie.',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// Modifier les informations personnelles
exports.updateUserProfile = async (req, res) => {
  const { fullname, bio } = req.body;

  try {
    // Récupérer l'utilisateur à partir de son ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Mettre à jour les champs nécessaires
    if (fullname) user.fullname = fullname;
    if (bio) user.bio = bio;

    // Sauvegarder les modifications
    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Désactiver un compte utilisateur
exports.desactivateAccount = async (req, res) => {
  const { password } = req.body;

  try {
    // Récupérer l'utilisateur connecté via son ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifier si le mot de passe correspond
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    // Désactiver le compte
    user.isActive = false;
    await user.save();

    res.status(200).json({ message: "Compte désactivé avec succès." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



