const Event   = require('../models/Event');
const Booking = require('../models/Booking');

const getStats = async (req, res) => {
  try {
    const totalBookings  = await Booking.countDocuments();
    const totalEvents    = await Event.countDocuments();
    const activeEvents   = await Event.countDocuments({ seatsLeft: { $gt: 0 } });
    const soldOutEvents  = await Event.countDocuments({ seatsLeft: 0 });

    const revenueResult  = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue   = revenueResult[0]?.total || 0;

    const ticketsResult  = await Booking.aggregate([
      { $unwind: '$tickets' },
      { $group: { _id: null, total: { $sum: '$tickets.qty' } } }
    ]);
    const totalTickets   = ticketsResult[0]?.total || 0;

    res.json({
      success: true,
      data: { totalBookings, totalTickets, totalRevenue, totalEvents, activeEvents, soldOutEvents }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats };
