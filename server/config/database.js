const { Pool } = require('pg');
require('dotenv').config();

// Log environment variables for debugging
console.log('Database config:', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: `${process.env.DB_PASSWORD}`, // Ensure password is interpreted as a string
  port: parseInt(process.env.DB_PORT, 10),
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Function to create tables if they don't exist
const createTables = async () => {
  const createWeddingEventsTable = `
    CREATE TABLE IF NOT EXISTS wedding_events (
      id SERIAL PRIMARY KEY,
      event_name VARCHAR(100) NOT NULL,
      event_date DATE NOT NULL,
      location VARCHAR(255)
    )
  `;

  const createPhotosTable = `
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      image_path VARCHAR(500) NOT NULL,
      wishes TEXT,
      filter VARCHAR(100),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    console.log('Creating tables...');
    await pool.query(createWeddingEventsTable);
    await pool.query(createPhotosTable);
    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err.message);
    throw err;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  createTables,
};
