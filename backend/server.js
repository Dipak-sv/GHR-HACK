require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startScheduler } = require('./src/services/scheduler.service');

const PORT = process.env.PORT || 5000;

// Start HTTP server immediately so Render's health check can reach it
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB in the background
connectDB()
  .then(() => {
    startScheduler();
    console.log('Database connected. All systems ready.');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    // Don't exit — server stays up so Render doesn't restart loop
  });

// Handle unhandled rejections gracefully
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
