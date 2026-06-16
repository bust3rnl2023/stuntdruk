const app = require('./app');
const db = require('./config/db');
require('dotenv').config();

const PORT = parseInt(process.env.PORT || '8080', 10);

const startServer = async () => {
  try {
    // Initialize Database (connection pool & table setup)
    await db.initDb();

    // Start Express Server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful Shutdown handling
    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await db.pool.end();
          console.log('PostgreSQL client pool terminated.');
          process.exit(0);
        } catch (err) {
          console.error('Error closing database pool:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
