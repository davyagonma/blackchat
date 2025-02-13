const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    text: { type: String },
    fileUrl: { type: String },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    discussionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', required: true },
    isReported: { type: Number, default: 0 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
