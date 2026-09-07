require('dotenv').config();
const { validateEnvironment } = require('./config/environment');

try {
  validateEnvironment();
} catch (error) {
  console.error(`Configuration error: ${error.message}`);
  process.exit(1);
}

const app = require('./app');
const { startJobs } = require('./jobs');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  startJobs();
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  server.close(() => process.exit(1));
  setTimeout(() => process.exit(1), 5000).unref();
});
