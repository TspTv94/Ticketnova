/**
 * TicketNova — Events Controller
 * File: backend/src/controllers/eventsController.js
 *
 * Handles all business logic for the /api/events route.
 */

const { events } = require('../models/events');

/**
 * GET /api/events
 * Query: ?category=music|sports|theater|tech|comedy|all
 */
const getAllEvents = (req, res) => {
  try {
    const { category } = req.query;
    let result = events;

    if (category && category !== 'all') {
      result = events.filter(e => e.category === category);
    }

    res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/events/:id
 */
const getEventById = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const event = events.find(e => e.id === id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/events/categories
 * Returns list of unique categories
 */
const getCategories = (req, res) => {
  const categories = [...new Set(events.map(e => e.category))];
  res.json({ success: true, data: categories });
};

module.exports = { getAllEvents, getEventById, getCategories };
