const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./config/database');
const photoRoutes = require('./routes/photoRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/photos', photoRoutes);

// Initialize server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Create tables if not exist
    await database.createTables();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();