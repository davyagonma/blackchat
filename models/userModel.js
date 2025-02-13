const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, 'Email invalide']
  },
  username: {
    type: String,
    required: [true, 'Username est requis'],
    unique: true,
    trim: true,
    minlength: [3, 'Username doit contenir au moins 3 caractères']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe est requis'],
    minlength: [8, 'Mot de passe doit contenir au moins 8 caractères'],
  },
  fullname: { type: String, required: true },
  bio: {
    type: String,
    maxlength: [500, 'Bio ne peut pas dépasser 500 caractères']
  },
  profilePhoto: {
    type: String,
    default: 'default-profile.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Middleware pour hasher le mot de passe avant l'enregistrement
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);