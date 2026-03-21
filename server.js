/**
 * TicketNova — Server Entry Point
 * File: backend/server.js
 *
 * Starts the Express HTTP server.
 * Keep this file minimal — all app logic lives in src/app.js
 */

const app = require('./src/app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║       🎟️  TicketNova API Server           ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Status  : Running                       ║`);
  console.log(`║  URL     : http://${HOST}:${PORT}             ║`);
  console.log(`║  Health  : http://localhost:${PORT}/health   ║`);
  console.log(`║  Env     : ${(process.env.NODE_ENV || 'development').padEnd(30)}║`);
  console.log('╚══════════════════════════════════════════╝\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = server;
