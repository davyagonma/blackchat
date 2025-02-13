const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['group', 'private', 'broadcast'], // Ajout de "broadcast" si nécessaire
    },
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Tableau de références d'utilisateurs
      validate: {
        validator: function (participants) {
          return participants.length >= 2 && participants.length <= 64;
        },
        message: 'Une discussion de groupe doit avoir entre 2 et 64 participants.',
      },
    },
    admins: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Tableau de références d'utilisateurs (admins)
    },
    isArchived: { type: Boolean, default: false },

    mutedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Utilisateurs qui ont mis en silencieux
    
    messagesRestricted: { type: Boolean, default: false }, // Restriction des messages
  },
  {
    timestamps: true, // Ajoute automatiquement les champs createdAt et updatedAt
  }
);

module.exports = mongoose.model('Discussion', discussionSchema);
