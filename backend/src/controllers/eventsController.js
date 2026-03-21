const { events } = require('../models/events');

const getAllEvents = (req, res) => {
  const { category } = req.query;
  const result = (!category || category === 'all')
    ? events
    : events.filter(e => e.category === category);
  res.json({ success: true, count: result.length, data: result });
};

const getEventById = (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: event });
};

const getCategories = (req, res) => {
  res.json({ success: true, data: [...new Set(events.map(e => e.category))] });
};

module.exports = { getAllEvents, getEventById, getCategories };
