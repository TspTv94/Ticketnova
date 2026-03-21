const { v4: uuidv4 }   = require('uuid');
const { BookingStore } = require('../models/bookings');
const { events }       = require('../models/events');

const createBooking = (req, res) => {
  try {
    const { eventId, customer, tickets } = req.body;

    if (!eventId || !customer || !tickets)
      return res.status(400).json({ success: false, message: 'eventId, customer and tickets are required.' });

    const { firstName, lastName, email, phone } = customer;
    if (!firstName || !lastName || !email || !phone)
      return res.status(400).json({ success: false, message: 'All customer fields are required.' });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, message: 'Invalid email address.' });

    if (!Array.isArray(tickets) || !tickets.length)
      return res.status(400).json({ success: false, message: 'Select at least one ticket.' });

    const event = events.find(e => e.id === parseInt(eventId));
    if (!event)
      return res.status(404).json({ success: false, message: 'Event not found.' });
    if (!event.seatsLeft)
      return res.status(400).json({ success: false, message: 'This event is sold out.' });

    let subtotal = 0;
    const ticketDetails = [];

    for (const t of tickets) {
      const tt = event.tickets.find(x => x.type === t.type);
      if (!tt)
        return res.status(400).json({ success: false, message: 'Ticket type "' + t.type + '" not found.' });
      if (!Number.isInteger(t.qty) || t.qty < 1 || t.qty > 10)
        return res.status(400).json({ success: false, message: 'Quantity must be 1 to 10.' });
      subtotal += tt.price * t.qty;
      ticketDetails.push({ type: t.type, qty: t.qty, price: tt.price });
    }

    const bookingFee = Math.round(subtotal * 0.03);
    const booking = {
      id:         'TN-' + uuidv4().split('-')[0].toUpperCase(),
      eventId:    event.id,
      eventTitle: event.title,
      eventDate:  event.date,
      eventTime:  event.time,
      venue:      event.venue,
      emoji:      event.emoji,
      gradient:   event.gradient,
      category:   event.category,
      customer,
      tickets:    ticketDetails,
      subtotal,
      bookingFee,
      total:      subtotal + bookingFee,
      status:     'confirmed',
      bookedAt:   new Date().toISOString()
    };

    BookingStore.create(booking);
    event.seatsLeft = Math.max(0, event.seatsLeft - ticketDetails.reduce((a, t) => a + t.qty, 0));

    res.status(201).json({ success: true, message: 'Booking confirmed!', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllBookings = (req, res) => {
  const data = req.query.email
    ? BookingStore.getByEmail(req.query.email)
    : BookingStore.getAll();
  res.json({ success: true, count: data.length, data });
};

const getBookingById = (req, res) => {
  const b = BookingStore.getById(req.params.id);
  if (!b) return res.status(404).json({ success: false, message: 'Booking not found.' });
  res.json({ success: true, data: b });
};

const cancelBooking = (req, res) => {
  if (!BookingStore.deleteById(req.params.id))
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  res.json({ success: true, message: 'Booking cancelled.' });
};

module.exports = { createBooking, getAllBookings, getBookingById, cancelBooking };
