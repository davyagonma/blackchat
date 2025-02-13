const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoute');
const contactRoutes = require('./routes/contactRoute');
const messageRoutes = require('./routes/messageRoute');
const discussionRoutes = require('./routes/discussionRoute');


dotenv.config();

// Connexion à MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json()); // Middleware pour JSON
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use("/api", contactRoutes);
app.use("/api", discussionRoutes);
app.use("/api", messageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
