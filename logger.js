/**
 * TicketNova — Request Logger Middleware
 * File: backend/src/middleware/logger.js
 *
 * Custom logger + Morgan integration.
 */

const morgan = require('morgan');

// Colorized dev format for terminal
const devLogger = morgan(':method :url :status :response-time ms — :res[content-length] bytes');

// JSON format for production/log aggregation
const prodLogger = morgan(
  JSON.stringify({
    method: ':method', url: ':url', status: ':status',
    responseTime: ':response-time', userAgent: ':user-agent',
    ip: ':remote-addr', date: ':date[iso]',
  })
);

const getLogger = () =>
  process.env.NODE_ENV === 'production' ? prodLogger : devLogger;

module.exports = { getLogger };
