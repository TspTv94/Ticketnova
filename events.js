/**
 * TicketNova — Events Routes
 * File: backend/src/routes/events.js
 */

const express = require('express');
const router  = express.Router();
const { getAllEvents, getEventById, getCategories } = require('../controllers/eventsController');

router.get('/',            getAllEvents);   // GET /api/events
router.get('/categories',  getCategories); // GET /api/events/categories
router.get('/:id',         getEventById);  // GET /api/events/:id

module.exports = router;
