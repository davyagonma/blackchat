const Discussion = require('../models/discussionModel');

const User = require('../models/userModel');

const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET; 

// Créer une discussion de groupe
exports.createGroupDiscussion = async (req, res) => {
  
  try {
    const { name, description, participants } = req.body;

    // Vérifier les participants
    if (!participants || participants.length < 2 || participants.length > 64) {
      return res.status(400).json({
        message: 'Une discussion de groupe doit avoir entre 2 et 64 participants.',
      });
    }

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
      const adminId = decoded.id; // Supposons que le champ "userId" est dans le payload du token

    // Créer une nouvelle discussion
    const newDiscussion = new Discussion({
      name,
      description,
      type: 'group', // Forcé à "group" pour cette fonctionnalité
      participants,
      admins:[adminId]
    });

    await newDiscussion.save();

    res.status(201).json({
      message: 'Discussion de groupe créée avec succès.',
      discussion: newDiscussion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//Recupérer tous les membres
exports.getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find(); // Récupère toutes les discussions
    res.status(200).json(discussions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Ajouter des membres a une discussion
exports.addMemberToDiscussion = async (req, res) => {
  const { discussionId } = req.params;
  const { memberId } = req.body; // ID de l'utilisateur à ajouter
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
      const adminId = decoded.id; // Supposons que le champ "userId" est dans le payload du token

  try {
    // Vérifier si la discussion existe
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    // Vérifier si le type de discussion est "groupe" ou "diffusion"
    if (!['groupe', 'diffusion'].includes(discussion.type)) {
      return res.status(400).json({ message: 'Les membres ne peuvent être ajoutés quà des discussions de type "groupe" ou "diffusion".' });
    }

    // Vérifier si l'utilisateur effectuant l'opération est un administrateur
    if (!discussion.admins.includes(adminId)) {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent ajouter des membres.' });
    }

    // Vérifier si l'utilisateur à ajouter est déjà dans la discussion
    if (discussion.participants.includes(memberId)) {
      return res.status(400).json({ message: "L'utilisateur est déjà membre de la discussion." });
    }

    // Ajouter le membre à la discussion
    discussion.participants.push(memberId);
    await discussion.save();

    res.status(200).json({
      message: "Membre ajouté avec succès à la discussion.",
      discussion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Retirer un membre d'une discussion
exports.removeMemberFromDiscussion = async (req, res) => {
  const { discussionId } = req.params;
  const { memberId } = req.body; // ID de l'utilisateur à retirer
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
      const adminId = decoded.id; // Supposons que le champ "userId" est dans le payload du token


  try {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    // Vérifier si la discussion est de type "group" ou "broadcast"
    if (!['group', 'broadcast'].includes(discussion.type)) {
      return res.status(400).json({ message: 'Cette action est uniquement autorisée pour les discussions de type groupe ou diffusion.' });
    }

    // Vérifier si l'utilisateur effectuant l'opération est un administrateur
    if (!discussion.admins.includes(adminId)) {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent retirer des membres.' });
    }

    // Vérifier si le membre à retirer fait partie de la discussion
    if (!discussion.participants.includes(memberId)) {
      return res.status(400).json({ message: "L'utilisateur ne fait pas partie de cette discussion." });
    }

    // Vérifier qu'il reste au moins 2 participants après le retrait
    if (discussion.participants.length <= 2) {
      return res.status(400).json({
        message: 'Impossible de retirer ce membre : une discussion doit avoir au moins 2 participants.',
      });
    }

    // Retirer le membre
    discussion.participants = discussion.participants.filter((id) => id.toString() !== memberId);
    await discussion.save();

    res.status(200).json({
      message: "Membre retiré avec succès de la discussion.",
      discussion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Ajouter un admin à une discussion
exports.addAdminToDiscussion = async (req, res) => {
  const { discussionId } = req.params;
  const { userId } = req.body; // ID de l'utilisateur à nommer admin
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
  const adminId = decoded.id; // Supposons que le champ "userId" est dans le payload du token


  try {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    // Vérifier si la discussion est de type "group" ou "broadcast"
    if (!['group', 'broadcast'].includes(discussion.type)) {
      return res.status(400).json({ message: 'Cette action est uniquement autorisée pour les discussions de type groupe ou diffusion.' });
    }

    // Vérifier si l'utilisateur effectuant l'opération est un administrateur
    if (!discussion.admins.includes(adminId)) {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent nommer un autre administrateur.' });
    }

    // Vérifier si l'utilisateur à nommer est un participant de la discussion
    if (!discussion.participants.includes(userId)) {
      return res.status(400).json({ message: "L'utilisateur doit appartenir à la discussion pour être nommé administrateur." });
    }

    // Vérifier si l'utilisateur est déjà administrateur
    if (discussion.admins.includes(userId)) {
      return res.status(400).json({ message: "L'utilisateur est déjà administrateur de la discussion." });
    }

    // Ajouter l'utilisateur à la liste des administrateurs
    discussion.admins.push(userId);
    await discussion.save();

    res.status(200).json({
      message: "Utilisateur nommé administrateur avec succès.",
      discussion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Modifier les informations d'une discussion
exports.updateDiscussionInfo = async (req, res) => {
  const { discussionId } = req.params;
  const { name, description } = req.body; // Champs à mettre à jour
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
  const adminId = decoded.id; // Supposons que le champ "userId" est dans le payload du token


  try {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    // Vérifier si la discussion est de type "group" ou "broadcast"
    if (!['group', 'broadcast'].includes(discussion.type)) {
      return res.status(400).json({ message: 'Cette action est uniquement autorisée pour les discussions de type groupe ou diffusion.' });
    }

    // Vérifier si l'utilisateur effectuant l'opération est un administrateur
    if (!discussion.admins.includes(adminId)) {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent modifier les informations de la discussion.' });
    }

    // Mettre à jour les informations
    if (name) discussion.name = name;
    if (description) discussion.description = description;

    await discussion.save();

    res.status(200).json({
      message: "Informations de la discussion mises à jour avec succès.",
      discussion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Archiver une discussion
exports.archiveDiscussion = async (req, res) => {
  const { discussionId } = req.params;
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
  const adminId = decoded.id; // Supposons que le champ "userId" est dans le payload du token


  try {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    // Archiver la discussion
    discussion.isArchived = true;
    await discussion.save();

    res.status(200).json({
      message: "Discussion archivée avec succès.",
      discussion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Récupérer discussion archivées
exports.getArchivedDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({ isArchived: true });

    res.status(200).json({
      message: "Discussions archivées récupérées avec succès.",
      discussions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Récupérer discussion non archivées
exports.getNonArchivedDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({ isArchived: false });

    res.status(200).json({
      message: "Discussions non archivées récupérées avec succès.",
      discussions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Exportez une discussion au format pdf
exports.exportDiscussionAsPDF = async (req, res) => {
  const { discussionId } = req.params;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(200).json({ message: "L'utilisateur n'est pas connecté." });
  }

  // Extraire le token
  const token = authHeader.split(' ')[2];

  if (!token || token == '' || token == null) {
    return res.status(200).json({ message: "L'utilisateur n'est pas connecté." });
  }
  // Décoder le token pour récupérer l'ID utilisateur
  const decoded = jwt.verify(token, secret); // Vérifiez si la clé secrète correspond
  const userId = decoded.id; // Supposons que le champ "userId" est dans le payload du token


  try {
    const discussion = await Discussion.findById(discussionId).populate('participants admins');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    // Vérifier si l'utilisateur appartient à la discussion
    if (!discussion.participants.includes(userId)) {
      return res.status(403).json({ message: 'Vous devez appartenir à cette discussion pour l’exporter.' });
    }
    const doc = new PDFDocument();
    const filename = `discussion_$.{discussionId}.pdf`;

    // Définir les en-têtes pour la réponse
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Lier le flux du document PDF à la réponse
    doc.pipe(res);

    // Contenu du document PDF
    doc.fontSize(16).text(`Discussion : ${discussion.name}`);
    doc.moveDown();
    doc.text(`Description : ${discussion.description}`);
    doc.moveDown();
    doc.text(`Type : ${discussion.type}`);
    doc.moveDown();
    doc.text(`Participants :`);
    discussion.participants.forEach(participant => {
      doc.text(`- ${participant._id}`);
    });

    // Terminer la génération du PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Mettre une discussion en mute
exports.muteDiscussion = async (req, res) => {
  const { discussionId } = req.params;
  const userId = req.user.id;

  try {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    // Vérifier si l'utilisateur appartient à la discussion
    if (!discussion.participants.includes(userId)) {
      return res.status(403).json({ message: 'Vous ne pouvez pas mettre en silencieux une discussion dont vous ne faites pas partie.' });
    }

    // Ajouter l'utilisateur à la liste des utilisateurs silencieux
    if (!discussion.mutedUsers) discussion.mutedUsers = [];
    if (discussion.mutedUsers.includes(userId)) {
      return res.status(400).json({ message: 'Vous avez déjà mis cette discussion en silencieux.' });
    }

    discussion.mutedUsers.push(userId);
    await discussion.save();

    res.status(200).json({ message: 'Discussion mise en silencieux avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Supprimer une discussion
exports.deleteDiscussion = async (req, res) => {
  const { discussionId } = req.params;
  const adminId = req.user.id;

  try {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    // Vérifier si l'utilisateur est administrateur
    if (!discussion.admins.includes(adminId)) {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent supprimer une discussion.' });
    }

    await discussion.remove();
    res.status(200).json({ message: 'Discussion supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Resteindre un message dans un groupe
exports.restrictMessagesInGroup = async (req, res) => {
  const { discussionId } = req.params;
  const adminId = req.user.id;

  try {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    // Vérifier si l'utilisateur est administrateur
    if (!discussion.admins.includes(adminId)) {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent restreindre les messages.' });
    }

    // Vérifier si c'est un groupe
    if (discussion.type !== 'group') {
      return res.status(400).json({ message: 'Cette action est réservée aux discussions de groupe.' });
    }

    discussion.messagesRestricted = true;
    await discussion.save();

    res.status(200).json({ message: 'Envoi de messages restreint avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Réactivez l'envoi de message dans une discussion
exports.enableMessagesInBroadcast = async (req, res) => {
  const { discussionId } = req.params;
  const adminId = req.user.id;

  try {
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion non trouvée.' });
    }

    // Vérifier si l'utilisateur est administrateur
    if (!discussion.admins.includes(adminId)) {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent réactiver les messages.' });
    }

    // Vérifier si c'est une diffusion
    if (discussion.type !== 'broadcast') {
      return res.status(400).json({ message: 'Cette action est réservée aux discussions de diffusion.' });
    }

    discussion.messagesRestricted = false;
    await discussion.save();

    res.status(200).json({ message: 'Envoi de messages réactivé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
