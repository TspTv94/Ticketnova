/**
 * TicketNova — Bookings Data Model
 * File: backend/src/models/bookings.js
 *
 * In-memory store for bookings.
 * Production upgrade: replace with Mongoose model + MongoDB Atlas.
 *
 * Example schema for MongoDB:
 * {
 *   id: String,            // 'TN-XXXXXXXX'
 *   eventId: Number,
 *   eventTitle: String,
 *   customer: {
 *     firstName: String,
 *     lastName: String,
 *     email: String,
 *     phone: String,
 *     city: String
 *   },
 *   tickets: [{ type: String, qty: Number, price: Number }],
 *   subtotal: Number,
 *   bookingFee: Number,
 *   total: Number,
 *   status: { type: String, enum: ['confirmed','cancelled'], default: 'confirmed' },
 *   bookedAt: Date
 * }
 */

let bookings = [];

const BookingStore = {
  getAll()        { return bookings; },
  getById(id)     { return bookings.find(b => b.id === id); },
  getByEmail(email) { return bookings.filter(b => b.customer.email === email); },

  create(booking) {
    bookings.push(booking);
    return booking;
  },

  deleteById(id) {
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) return false;
    bookings.splice(idx, 1);
    return true;
  },

  stats() {
    const totalRevenue = bookings.reduce((acc, b) => acc + b.total, 0);
    const totalTickets = bookings.reduce((acc, b) =>
      acc + b.tickets.reduce((s, t) => s + t.qty, 0), 0);
    return {
      totalBookings: bookings.length,
      totalTickets,
      totalRevenue,
    };
  }
};

module.exports = { BookingStore };
