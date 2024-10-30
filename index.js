const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const morgan = require('morgan');

const app = express();
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'path/to/database.sqlite', // Change this to your desired path
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Request logging

// Define Profile model
const Profile = sequelize.define('Profile', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  about: DataTypes.TEXT,
  bio: DataTypes.TEXT,
  location: DataTypes.STRING,
  followerCount: DataTypes.INTEGER,
  connectionCount: DataTypes.INTEGER,
});

// Sync database with error handling
sequelize.sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

// API endpoint to save profile data
app.post('/api/profile-data', async (req, res) => {
  const { name, url } = req.body;

  // Basic validation
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required.' });
  }

  try {
    const profile = await Profile.create(req.body);
    console.log('Saved Profile:', profile.toJSON());
    res.status(201).json(profile);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to save profile data' });
  }
});

// API endpoint to retrieve all profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await Profile.findAll();
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Error retrieving profiles:', error);
    res.status(500).json({ error: 'Failed to retrieve profiles' });
  }
});

// Start server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
