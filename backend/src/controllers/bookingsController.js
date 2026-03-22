const { v4: uuidv4 }  = require('uuid');
const Booking         = require('../models/Booking');
const Event           = require('../models/Event');
const mongoose        = require('mongoose');

const createBooking = async (req, res) => {
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

    // Find event by MongoDB _id OR by numeric-style search
    let event = null;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      event = await Event.findById(eventId);
    }
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found. Please refresh the page and try again.' });
    }

    if (!event.seatsLeft)
      return res.status(400).json({ success: false, message: 'This event is sold out.' });

    let subtotal = 0;
    const ticketDetails = [];

    for (const t of tickets) {
      const tt = event.tickets.find(x => x.type === t.type);
      if (!tt)
        return res.status(400).json({ success: false, message: `Ticket type "${t.type}" not found.` });
      if (!Number.isInteger(t.qty) || t.qty < 1 || t.qty > 10)
        return res.status(400).json({ success: false, message: 'Quantity must be 1 to 10.' });
      subtotal += tt.price * t.qty;
      ticketDetails.push({ type: t.type, qty: t.qty, price: tt.price });
    }

    const bookingFee = Math.round(subtotal * 0.03);
    const totalQty   = ticketDetails.reduce((a, t) => a + t.qty, 0);

    const booking = await Booking.create({
      eventId:    event._id,
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
      total: subtotal + bookingFee,
      status: 'confirmed'
    });

    await Event.findByIdAndUpdate(eventId, {
      $inc: { seatsLeft: -totalQty }
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      data: {
        id:         booking._id,
        eventId:    booking.eventId,
        eventTitle: booking.eventTitle,
        eventDate:  booking.eventDate,
        eventTime:  booking.eventTime,
        venue:      booking.venue,
        emoji:      booking.emoji,
        gradient:   booking.gradient,
        category:   booking.category,
        customer:   booking.customer,
        tickets:    booking.tickets,
        subtotal:   booking.subtotal,
        bookingFee: booking.bookingFee,
        total:      booking.total,
        status:     booking.status,
        bookedAt:   booking.bookedAt
      }
    });

  } catch (err) {
    console.error('Booking error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const filter = req.query.email
      ? { 'customer.email': req.query.email }
      : {};
    const bookings = await Booking.find(filter).sort({ bookedAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, message: 'Booking cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBooking, getAllBookings, getBookingById, cancelBooking };
