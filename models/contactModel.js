const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  userId1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Demandeur
  userId2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Destinataire
  isAccepted: { type: Boolean, default: false }, // Statut de la relation
  createdAt: { type: Date, default: Date.now } // Date de la demande
});

module.exports = mongoose.model("Contact", contactSchema);
