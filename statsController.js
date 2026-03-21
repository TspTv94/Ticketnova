/**
 * TicketNova — Stats Controller
 * File: backend/src/controllers/statsController.js
 */

const { BookingStore } = require('../models/bookings');
const { events }       = require('../models/events');

/**
 * GET /api/stats
 */
const getStats = (req, res) => {
  try {
    const bookingStats = BookingStore.stats();
    res.json({
      success: true,
      data: {
        ...bookingStats,
        activeEvents:  events.filter(e => e.seatsLeft > 0).length,
        soldOutEvents: events.filter(e => e.seatsLeft === 0).length,
        totalEvents:   events.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = { getStats };
