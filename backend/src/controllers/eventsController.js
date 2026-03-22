const Event = require('../models/Event');

const getAllEvents = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = (!category || category === 'all') ? {} : { category };
    const events = await Event.find(filter);
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Event.distinct('category');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllEvents, getEventById, getCategories };
