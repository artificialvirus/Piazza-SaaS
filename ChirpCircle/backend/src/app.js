// src/app.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');

// Require Passport configuration before initialising
require('./config/passport'); // This will run the code in `passport.js`

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1', routes);

// CORS configuration: Restrict allowed origins based on environment
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000']; // local origin
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}));

// Enhanced Helmet configuration
app.use(helmet({
  contentSecurityPolicy: false, // Disable default CSP
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginEmbedderPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-origin' }
}));


// Conditional logging level based on environment
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // More standardised logging
} else {
  app.use(morgan('dev')); // More verbose logging in development
}

// Initialise Passport middleware
app.use(passport.initialize());

// Health check endpoint
// Kubernetes or other monitoring services can use this to check if the app is alive
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK' });
});

app.get('/', (req, res) => {
  res.send('Welcome to ChirpCircle!');
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;

