require("dotenv").config();
// services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Vérification des variables d'environnement nécessaires
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.APP_URL ||
      !process.env.MAIL_FROM
    ) {
      throw new Error('Certaines variables d\'environnement pour le service email sont manquantes');
    }

    // Configuration du transporteur nodemailer
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: parseInt(process.env.SMTP_PORT, 10) === 465, // SSL pour le port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Envoi de l'email de vérification
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.APP_URL}/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.MAIL_FROM, // Configurable via .env
      to: user.email, // Email de l'utilisateur
      subject: 'Vérifiez votre compte',
      html: `
        <h1>Bienvenue ${user.fullname}!</h1>
        <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre compte :</p>
        <a href="${verificationUrl}">Vérifier mon compte</a>
        <p>Ce lien expire dans 24 heures.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email de vérification envoyé à ${user.email}`);
    } catch (error) {
      console.error('Erreur d\'envoi d\'email de vérification:', error);
      throw new Error('Erreur lors de l\'envoi de l\'email de vérification');
    }
  }

  // Envoi de l'email de réinitialisation de mot de passe
  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.APP_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.MAIL_FROM, // Configurable via .env
      to: user.email,
      subject: 'Réinitialisation de mot de passe',
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien ci-dessous :</p>
        <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
        <p>Ce lien expire dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email de réinitialisation envoyé à ${user.email}`);
    } catch (error) {
      console.error('Erreur d\'envoi d\'email de réinitialisation:', error);
      throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  }
}

module.exports = new EmailService();
