const express = require('express');

const { protect } = require('../middlewares/authMiddleware');

const { createGroupDiscussion, getAllDiscussions, addMemberToDiscussion, removeMemberFromDiscussion, 
        addAdminToDiscussion, updateDiscussionInfo, getNonArchivedDiscussions, getArchivedDiscussions, 
        archiveDiscussion,  exportDiscussionAsPDF, muteDiscussion, deleteDiscussion, restrictMessagesInGroup, enableMessagesInBroadcast,
    } = require('../controllers/discussionController');

const router = express.Router();

// Route pour créer une discussion de groupe
router.post('/discussions/group', createGroupDiscussion);

// Route pour récupérer toutes les discussions
router.get('/discussions', getAllDiscussions);

// Route pour ajouter un membre à une discussion
router.put('/discussions/addMemberToDiscussion/:discussionId',  addMemberToDiscussion);

// Route pour retirer un membre d'une discussion
router.delete('/discussions/:discussionId/members', removeMemberFromDiscussion);

// Route pour nommer un administrateur dans une discussion
router.put('/discussions/:discussionId/admins',  addAdminToDiscussion);

// Route pour modifier les informations d'une discussion
router.put('/discussions/:discussionId',  updateDiscussionInfo);

// Route pour lister les discussions non archivées
router.get('/discussions/non-archived',  getNonArchivedDiscussions);

// Route pour lister les discussions archivées
router.get('/discussions/archived',  getArchivedDiscussions);

// Route pour archiver une discussion
router.put('/discussions/:discussionId/archive',  archiveDiscussion);

// Exporter une discussion en PDF
router.get('/discussions/:discussionId/export',  exportDiscussionAsPDF);

// Mettre une discussion en silencieux
router.put('/discussions/:discussionId/mute',  muteDiscussion);

// Supprimer une discussion
router.delete('/discussions/:discussionId',  deleteDiscussion);

// Restreindre les messages dans un groupe
router.put('/discussions/:discussionId/restrict',  restrictMessagesInGroup);

// Réactiver les messages dans une diffusion
router.put('/discussions/:discussionId/enable',  enableMessagesInBroadcast);

module.exports = router;
