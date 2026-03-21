let bookings = [];

const BookingStore = {
  getAll()          { return bookings; },
  getById(id)       { return bookings.find(b => b.id === id); },
  getByEmail(email) { return bookings.filter(b => b.customer.email === email); },
  create(booking)   { bookings.push(booking); return booking; },
  deleteById(id) {
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) return false;
    bookings.splice(idx, 1);
    return true;
  },
  stats() {
    return {
      totalBookings: bookings.length,
      totalTickets:  bookings.reduce((a, b) => a + b.tickets.reduce((s, t) => s + t.qty, 0), 0),
      totalRevenue:  bookings.reduce((a, b) => a + b.total, 0)
    };
  }
};

module.exports = { BookingStore };
