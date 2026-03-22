const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  eventId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  eventTitle: { type: String, required: true },
  eventDate:  { type: String, required: true },
  eventTime:  { type: String, required: true },
  venue:      { type: String, required: true },
  emoji:      { type: String },
  gradient:   { type: String },
  category:   { type: String },
  customer: {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true },
    phone:     { type: String, required: true },
    city:      { type: String }
  },
  tickets: [{
    type:  { type: String, required: true },
    qty:   { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  subtotal:   { type: Number, required: true },
  bookingFee: { type: Number, required: true },
  total:      { type: Number, required: true },
  status:     { type: String, default: 'confirmed' },
  bookedAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
