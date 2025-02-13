const Message = require('../models/messageModel');
const Discussion = require('../models/discussionModel');
const User = require('../models/userModel');


// Créer un nouveau message
exports.createMessage = async (req, res) => {
  try {
    const { senderId, text, idDiscussion, file } = req.body;
    const newMessage = new Message({ senderId, text, idDiscussion, file });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Récupérer les messages d'une discussion
exports.getMessagesByDiscussion = async (req, res) => {
  try {
    const messages = await Message.find({ idDiscussion: req.params.idDiscussion });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Modifier un message
exports.updateMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    if (req.body.text) message.text = req.body.text;
    if (req.body.file) {
      message.file.type = req.body.file.type;
      message.file.size = req.body.file.size;
      message.file.url = req.body.file.url;
    }
    const updatedMessage = await message.save();
    res.json(updatedMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer un message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    await message.remove();
    res.json({ message: 'Message supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer tous les messages d'une discussion
exports.deleteMessagesByDiscussion = async (req, res) => {
  try {
    await Message.deleteMany({ idDiscussion: req.params.idDiscussion });
    res.json({ message: 'Tous les messages de la discussion ont été supprimés' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Signaler un message
exports.reportMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    message.isReported = true;
    await message.save();
    res.json({ message: 'Message signalé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Marquer un message comme lu
exports.markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    message.isRead = true;
    await message.save();
    res.json({ message: 'Message marqué comme lu' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};