/**
 * TicketNova — Bookings Controller
 * File: backend/src/controllers/bookingsController.js
 *
 * Handles all business logic for the /api/bookings route.
 */

const { v4: uuidv4 } = require('uuid');
const { BookingStore } = require('../models/bookings');
const { events }       = require('../models/events');

/**
 * POST /api/bookings
 * Body: { eventId, customer: { firstName, lastName, email, phone, city }, tickets: [{ type, qty }] }
 */
const createBooking = (req, res) => {
  try {
    const { eventId, customer, tickets } = req.body;

    // ── Required field validation ─────────────────────────
    if (!eventId || !customer || !tickets) {
      return res.status(400).json({
        success: false,
        message: 'eventId, customer, and tickets are required.',
      });
    }

    const { firstName, lastName, email, phone } = customer;
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer firstName, lastName, email, and phone are required.',
      });
    }

    // ── Email format check ────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    // ── Tickets validation ────────────────────────────────
    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ success: false, message: 'Select at least one ticket.' });
    }

    // ── Event existence check ─────────────────────────────
    const event = events.find(e => e.id === parseInt(eventId));
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    if (event.seatsLeft === 0) {
      return res.status(400).json({ success: false, message: 'This event is sold out.' });
    }

    // ── Calculate totals ──────────────────────────────────
    let subtotal = 0;
    const ticketDetails = [];

    for (const t of tickets) {
      const ticketType = event.tickets.find(tt => tt.type === t.type);
      if (!ticketType) {
        return res.status(400).json({
          success: false,
          message: `Ticket type "${t.type}" not found for this event.`,
        });
      }
      if (!Number.isInteger(t.qty) || t.qty < 1 || t.qty > 10) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for "${t.type}". Must be 1–10.`,
        });
      }
      subtotal += ticketType.price * t.qty;
      ticketDetails.push({ type: t.type, qty: t.qty, price: ticketType.price });
    }

    const bookingFee = Math.round(subtotal * 0.03);
    const total      = subtotal + bookingFee;

    // ── Create booking record ─────────────────────────────
    const booking = {
      id: 'TN-' + uuidv4().split('-')[0].toUpperCase(),
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      venue: event.venue,
      emoji: event.emoji,
      gradient: event.gradient,
      category: event.category,
      customer: {
        firstName: customer.firstName,
        lastName:  customer.lastName,
        email:     customer.email,
        phone:     customer.phone,
        city:      customer.city || '',
      },
      tickets: ticketDetails,
      subtotal,
      bookingFee,
      total,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };

    BookingStore.create(booking);

    // ── Update seat count ─────────────────────────────────
    const totalQty = ticketDetails.reduce((acc, t) => acc + t.qty, 0);
    event.seatsLeft = Math.max(0, event.seatsLeft - totalQty);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      data: booking,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/bookings
 * Query: ?email=user@example.com (optional filter)
 */
const getAllBookings = (req, res) => {
  try {
    const { email } = req.query;
    const data = email
      ? BookingStore.getByEmail(email)
      : BookingStore.getAll();

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/bookings/:id
 */
const getBookingById = (req, res) => {
  try {
    const booking = BookingStore.getById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * DELETE /api/bookings/:id
 */
const cancelBooking = (req, res) => {
  try {
    const deleted = BookingStore.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = { createBooking, getAllBookings, getBookingById, cancelBooking };
