// server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/database');
const PORT = process.env.PORT || 3000;

let server;
let dbConnection;

// Function to gracefully shut down the server
async function closeServer() {
  console.log('Received shutdown signal, closing server...');

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
    });
  }

  // cronJob.stop();

  // Close DB connection
  if (dbConnection && dbConnection.connection.readyState === 1) {
    await dbConnection.connection.close();
    console.log('Database connection closed.');
  }

  process.exit(0);
}

// Connect to the database
connectDB()
  .then((connection) => {
    dbConnection = connection;
    // Include the scheduler after successful DB connection
    require('./scheduler/expirePosts');

    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  });

// Listen for shutdown signals
process.on('SIGTERM', closeServer);
process.on('SIGINT', closeServer);

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  closeServer(); // Shut down gracefully on unhandled promise rejections
});

