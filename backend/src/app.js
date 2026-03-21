const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const eventsRouter = require('./routes/events');
const bookingsRouter = require('./routes/bookings');
const { getStats } = require('./controllers/statsController');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'TicketNova API', timestamp: new Date().toISOString() });
});

app.use('/api/events', eventsRouter);
app.use('/api/bookings', bookingsRouter);
app.get('/api/stats', getStats);

app.use(express.static('/app/frontend'));

app.get('*', (req, res) => {
  res.sendFile('/app/frontend/index.html');
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
