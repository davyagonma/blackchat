const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

// Créer un nouveau message
router.post('/messages', messagesController.createMessage);

// Récupérer les messages d'une discussion
router.get('/discussions/:idDiscussion/messages', messagesController.getMessagesByDiscussion);

// Modifier un message
router.patch('/messages/:id', messagesController.updateMessage);

// Supprimer un message
router.delete('/messages/:id', messagesController.deleteMessage);

// Supprimer tous les messages d'une discussion
router.delete('/discussions/:idDiscussion/messages', messagesController.deleteMessagesByDiscussion);

// Signaler un message
router.patch('/messages/:id/report', messagesController.reportMessage);

// Marquer un message comme lu
router.patch('/messages/:id/read', messagesController.markMessageAsRead);

module.exports = router;