// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbURI = process.env.DB_URI || 'mongodb://localhost:27017/chirpcircle';

    await mongoose.connect(dbURI, {
    });

    mongoose.connection.on('connect', () => {
      console.log('Mongoose connected to', dbURI);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });
    
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

