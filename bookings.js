/**
 * TicketNova — Bookings Routes
 * File: backend/src/routes/bookings.js
 */

const express = require('express');
const router  = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingsController');

router.post('/',    createBooking);   // POST   /api/bookings
router.get('/',     getAllBookings);  // GET    /api/bookings
router.get('/:id',  getBookingById); // GET    /api/bookings/:id
router.delete('/:id', cancelBooking);// DELETE /api/bookings/:id

module.exports = router;
