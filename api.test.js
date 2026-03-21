/**
 * TicketNova — API Tests
 * File: backend/tests/api.test.js
 *
 * Tests all REST endpoints using supertest.
 * Run: npm test
 */

const request = require('supertest');
const app     = require('../src/app');

/* ── Health Check ──────────────────────────────────────────── */
describe('GET /health', () => {
  it('returns 200 and status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.service).toBe('TicketNova API');
  });
});

/* ── Events ────────────────────────────────────────────────── */
describe('GET /api/events', () => {
  it('returns all events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('filters events by category', async () => {
    const res = await request(app).get('/api/events?category=music');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every(e => e.category === 'music')).toBe(true);
  });

  it('returns all events for category=all', async () => {
    const all      = await request(app).get('/api/events');
    const filtered = await request(app).get('/api/events?category=all');
    expect(filtered.body.count).toBe(all.body.count);
  });
});

describe('GET /api/events/:id', () => {
  it('returns a single event by ID', async () => {
    const res = await request(app).get('/api/events/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  it('returns 404 for unknown ID', async () => {
    const res = await request(app).get('/api/events/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

/* ── Bookings ──────────────────────────────────────────────── */
describe('POST /api/bookings', () => {
  const validPayload = {
    eventId: 1,
    customer: {
      firstName: 'Rahul',
      lastName:  'Sharma',
      email:     'rahul@example.com',
      phone:     '+91 98765 43210',
      city:      'Mumbai',
    },
    tickets: [{ type: 'Gold', qty: 2 }],
  };

  it('creates a booking successfully', async () => {
    const res = await request(app).post('/api/bookings').send(validPayload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^TN-/);
    expect(res.body.data.total).toBeGreaterThan(0);
  });

  it('rejects missing customer fields', async () => {
    const res = await request(app).post('/api/bookings').send({
      eventId: 1,
      customer: { firstName: 'Rahul' },
      tickets: [{ type: 'Gold', qty: 1 }],
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid email format', async () => {
    const payload = { ...validPayload, customer: { ...validPayload.customer, email: 'not-an-email' } };
    const res = await request(app).post('/api/bookings').send(payload);
    expect(res.statusCode).toBe(400);
  });

  it('rejects invalid ticket type', async () => {
    const payload = { ...validPayload, tickets: [{ type: 'Platinum', qty: 1 }] };
    const res = await request(app).post('/api/bookings').send(payload);
    expect(res.statusCode).toBe(400);
  });

  it('rejects booking for non-existent event', async () => {
    const payload = { ...validPayload, eventId: 9999 };
    const res = await request(app).post('/api/bookings').send(payload);
    expect(res.statusCode).toBe(404);
  });

  it('rejects booking for sold-out event', async () => {
    const payload = { ...validPayload, eventId: 5 }; // Event 5 is sold out
    const res = await request(app).post('/api/bookings').send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/sold out/i);
  });
});

describe('GET /api/bookings', () => {
  it('returns list of bookings', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('filters bookings by email', async () => {
    const res = await request(app).get('/api/bookings?email=rahul@example.com');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every(b => b.customer.email === 'rahul@example.com')).toBe(true);
  });
});

describe('DELETE /api/bookings/:id', () => {
  it('cancels an existing booking', async () => {
    // First create one
    const create = await request(app).post('/api/bookings').send({
      eventId: 2,
      customer: { firstName: 'Test', lastName: 'User', email: 'test@test.com', phone: '1234567890' },
      tickets: [{ type: 'Lower Tier', qty: 1 }],
    });
    const bookingId = create.body.data.id;

    const del = await request(app).delete(`/api/bookings/${bookingId}`);
    expect(del.statusCode).toBe(200);
    expect(del.body.success).toBe(true);
  });

  it('returns 404 for unknown booking ID', async () => {
    const res = await request(app).delete('/api/bookings/TN-NOTREAL');
    expect(res.statusCode).toBe(404);
  });
});

/* ── Stats ─────────────────────────────────────────────────── */
describe('GET /api/stats', () => {
  it('returns platform statistics', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalBookings');
    expect(res.body.data).toHaveProperty('totalRevenue');
    expect(res.body.data).toHaveProperty('activeEvents');
  });
});
