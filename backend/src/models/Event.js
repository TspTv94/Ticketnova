const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  type:  { type: String, required: true },
  desc:  { type: String, required: true },
  price: { type: Number, required: true }
});

const eventSchema = new mongoose.Schema({
  category:   { type: String, required: true },
  featured:   { type: Boolean, default: false },
  title:      { type: String, required: true },
  date:       { type: String, required: true },
  time:       { type: String, required: true },
  venue:      { type: String, required: true },
  gradient:   { type: String, required: true },
  emoji:      { type: String, required: true },
  seatsLeft:  { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  tickets:    [ticketTypeSchema]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
