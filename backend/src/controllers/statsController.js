const { BookingStore } = require('../models/bookings');
const { events }       = require('../models/events');

const getStats = (req, res) => {
  const s = BookingStore.stats();
  res.json({
    success: true,
    data: {
      ...s,
      activeEvents:  events.filter(e => e.seatsLeft > 0).length,
      soldOutEvents: events.filter(e => e.seatsLeft === 0).length,
      totalEvents:   events.length
    }
  });
};

module.exports = { getStats };
