const app  = require('./src/app');
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║       🎟️  TicketNova API Server           ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  URL    : http://localhost:' + PORT + '             ║');
  console.log('║  Health : http://localhost:' + PORT + '/health   ║');
  console.log('╚══════════════════════════════════════════╝\n');
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));

module.exports = server;
