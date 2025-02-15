const User = require('../models/userModel');
const Contact = require('../models/contactModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET; 

// rechercher un contact
exports.searchContact = async (req, res) => {
  try {
    const { username } = req.query;

    // Vérifier que le champ "username" est valide
    if (!username || username.length < 3) {
      return res.status(400).json({ message: "Veuillez fournir au moins 3 caractères pour la recherche." });
    }

    // Nettoyer la chaîne de caractères
    const sanitizedUsername = username.trim();

    // Rechercher les utilisateurs par nom d'utilisateur
    const users = await User.find({
      username: { $regex: sanitizedUsername, $options: "i" },
    });

    // Vérifier si des résultats ont été trouvés
    if (users.length === 0) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé pour cette recherche." });
    }

    // Retourner les résultats trouvés
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la recherche.", error });
  }
};

  
// envoyer une demande de contact
exports.sendContactRequest = async (req, res) => {
    try {
      const { userId2 } = req.body;

      // Vérifier si un token est présent dans le header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(200).json({ message: "L'utilisateur n'est pas connecté." });
      }

      // // Extraire le token
      const token = authHeader.split(' ')[2];
      if (!token || token == '' || token == null) {
        return res.status(200).json({ message: "L'utilisateur n'est pas connecté." });
      }
      // Décoder le token pour récupérer l'ID utilisateur
      const decoded = jwt.verify(token, secret); // Vérifiez si la clé secrète correspond
      const userId1 = decoded.id; // Supposons que le champ "userId" est dans le payload du token

      // Vérifier que la demande n'existe pas déjà
      const existingContact = await Contact.findOne({ userId1, userId2 });
      if (existingContact) {
        return res.status(400).json({ message: "Une demande de contact existe déjà entre ces utilisateurs." });
      }
  
      const newContact = new Contact({ userId1, userId2 });
      await newContact.save();
  
      return res.status(201).json({ message: "Demande de contact envoyée avec succès.", contact: newContact });
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de l'envoi de la demande.", error });
    }
  };

  
// accepter une demande de contact
exports.acceptContactRequest = async (req, res) => {
    try {
      const { contactId } = req.params;
  
      const contact = await Contact.findById(contactId);
      if (!contact) {
        return res.status(404).json({ message: "Demande de contact non trouvée." });
      }
  
      contact.isAccepted = true;
      await contact.save();
  
      return res.status(200).json({ message: "Demande de contact acceptée.", contact });
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de l'acceptation de la demande.", error });
    }
  };
  
// Refuser une demande de contact
exports.rejectContactRequest = async (req, res) => {
    try {
      const { contactId } = req.params;
  
      const contact = await Contact.findByIdAndDelete(contactId);
      if (!contact) {
        return res.status(404).json({ message: "Demande de contact non trouvée." });
      }
  
      return res.status(200).json({ message: "Demande de contact refusée." });
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors du refus de la demande.", error });
    }
  };

// Liste des demandes de contact reçues
exports.listReceivedRequests = async (req, res) => {
    try {
       // Vérifier si un token est présent dans le header Authorization
       const authHeader = req.headers.authorization;
       if (!authHeader || !authHeader.startsWith('Bearer')) {
         return res.status(200).json({ message: "L'utilisateur n'est pas connecté." });
       }
 
       // // Extraire le token
       const token = authHeader.split(' ')[1];
       if (!token || token == '' || token == null) {
         return res.status(200).json({ message: "L'utilisateur n'est pas connecté." });
       }
       // Décoder le token pour récupérer l'ID utilisateur
       const decoded = jwt.verify(token, secret); // Vérifiez si la clé secrète correspond
       const userId = decoded.id; // Supposons que le champ "userId" est dans le payload du token
  
      const requests = await Contact.find({ userId1: userId, isAccepted: false }).populate("userId2", "username");
      return res.status(200).json({requests: requests});
      //return res.status(200).json({requests: requests});
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la récupération des demandes.", error });
    }
  };

// bloquer un contact
exports.blockContact = async (req, res) => {
    try {
      const { contactId } = req.params;
  
      const contact = await Contact.findById(contactId);
      if (!contact || !contact.isAccepted) {
        return res.status(400).json({ message: "Le contact n'est pas établi ou n'existe pas." });
      }
  
      await Contact.findByIdAndDelete(contactId);
  
      return res.status(200).json({ message: "Contact bloqué avec succès." });
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors du blocage du contact.", error });
    }
  };

// liste des contacts etablis
exports.listContacts = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const contacts = await Contact.find({ 
        $or: [{ userId1: userId }, { userId2: userId }], 
        isAccepted: true 
      }).populate("userId1 userId2", "username");
  
      return res.status(200).json(contacts);
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la récupération des contacts.", error });
    }
  };

// supprimer un contact
exports.deleteContact = async (req, res) => {
    try {
      const { contactId } = req.params;
  
      const contact = await Contact.findByIdAndDelete(contactId);
      if (!contact) {
        return res.status(404).json({ message: "Contact non trouvé." });
      }
  
      return res.status(200).json({ message: "Contact supprimé avec succès." });
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la suppression du contact.", error });
    }
  };
  