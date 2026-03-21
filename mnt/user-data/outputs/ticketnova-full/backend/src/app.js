/**
 * TicketNova — Express App Setup
 * File: backend/src/app.js
 *
 * Tier 2 — Application Layer
 * Sets up middleware, routes, and error handling.
 * Separated from server.js so it can be tested independently.
 */

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');

const eventsRouter   = require('./routes/events');
const bookingsRouter = require('./routes/bookings');
const { getStats }   = require('./controllers/statsController');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { getLogger }  = require('./middleware/logger');

const app = express();

/* ── Security Middleware ───────────────────────────────────── */
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* ── Logging ───────────────────────────────────────────────── */
app.use(getLogger());

/* ── Body Parsing ──────────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

/* ── Health Check ──────────────────────────────────────────── */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'TicketNova API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

/* ── API Routes ────────────────────────────────────────────── */
app.use('/api/events',   eventsRouter);
app.use('/api/bookings', bookingsRouter);
app.get('/api/stats',    getStats);

/* ── Serve Frontend Static Files ──────────────────────────── */
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// SPA fallback — serve index.html for any non-API route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

/* ── 404 & Error Handler ───────────────────────────────────── */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
