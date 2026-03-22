const API_BASE = '/api';

const ApiService = {

  async getEvents(category = 'all') {
    try {
      const url = category === 'all'
        ? `${API_BASE}/events`
        : `${API_BASE}/events?category=${category}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('API unavailable, using local data:', err.message);
      return category === 'all'
        ? LOCAL_EVENTS
        : LOCAL_EVENTS.filter(e => e.category === category);
    }
  },

  async createBooking(payload) {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      return { success: true, data: data.data };
    } catch (err) {
      console.error('Booking API error:', err.message);
      const id = 'TN-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      return { success: true, data: { id, ...payload }, offline: true };
    }
  },

  async getBookings(email = null) {
    try {
      const url = email
        ? `${API_BASE}/bookings?email=${encodeURIComponent(email)}`
        : `${API_BASE}/bookings`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.data;
    } catch (err) {
      return [];
    }
  }
};

const LOCAL_EVENTS = [
  {
    id: 1, category: 'music', featured: true,
    title: 'Arijit Singh Live',
    date: 'SAT, 15 MAR 2025', time: '7:00 PM',
    venue: 'DY Patil Stadium, Mumbai',
    gradient: 'linear-gradient(135deg,#ff3c5f,#ff9500)',
    emoji: '🎤', seatsLeft: 48, totalSeats: 500,
    tickets: [
      { type: 'General', desc: 'Standing area', price: 1499 },
      { type: 'Gold',    desc: 'Seated view',   price: 2999 },
      { type: 'VIP',     desc: 'Front row + meet and greet', price: 7999 }
    ]
  },
  {
    id: 2, category: 'sports',
    title: 'IPL: MI vs CSK',
    date: 'SUN, 22 MAR 2025', time: '3:30 PM',
    venue: 'Wankhede Stadium, Mumbai',
    gradient: 'linear-gradient(135deg,#06d6a0,#0077b6)',
    emoji: '🏏', seatsLeft: 120, totalSeats: 600,
    tickets: [
      { type: 'Lower Tier', desc: 'Pitch-level seating', price: 2500 },
      { type: 'Upper Tier', desc: 'Full ground view',    price: 1800 },
      { type: 'Club House', desc: 'Premium lounge',      price: 8500 }
    ]
  },
  {
    id: 3, category: 'theater',
    title: 'Mughal-E-Azam Musical',
    date: 'FRI, 28 MAR 2025', time: '6:30 PM',
    venue: 'NCPA, Mumbai',
    gradient: 'linear-gradient(135deg,#ffd166,#ef476f)',
    emoji: '🎭', seatsLeft: 22, totalSeats: 300,
    tickets: [
      { type: 'Circle',         desc: 'Upper level',  price: 3000 },
      { type: 'Stalls',         desc: 'Ground floor', price: 4500 },
      { type: 'Premium Stalls', desc: 'Best seats',   price: 6500 }
    ]
  },
  {
    id: 4, category: 'tech',
    title: 'Google I/O Extended',
    date: 'SAT, 5 APR 2025', time: '9:00 AM',
    venue: 'Bombay Exhibition Centre',
    gradient: 'linear-gradient(135deg,#7b2fff,#0077b6)',
    emoji: '💻', seatsLeft: 200, totalSeats: 800,
    tickets: [
      { type: 'Standard Pass', desc: 'All sessions', price: 999  },
      { type: 'Pro Pass',      desc: 'Workshops',    price: 2499 },
      { type: 'Speaker Pass',  desc: 'Lounge access',price: 4999 }
    ]
  },
  {
    id: 5, category: 'comedy',
    title: 'Zakir Khan: Haq Se Single',
    date: 'SAT, 12 APR 2025', time: '8:00 PM',
    venue: 'Bal Gandharva Rang Mandir, Pune',
    gradient: 'linear-gradient(135deg,#ff9500,#ff3c5f)',
    emoji: '😂', seatsLeft: 0, totalSeats: 400,
    tickets: [
      { type: 'Standard', desc: 'General admission', price: 1299 },
      { type: 'Premium',  desc: 'Centre stage',      price: 2199 }
    ]
  },
  {
    id: 6, category: 'music',
    title: 'EDM Night: Sunburn',
    date: 'FRI, 18 APR 2025', time: '9:00 PM',
    venue: 'Mahalaxmi Racecourse, Mumbai',
    gradient: 'linear-gradient(135deg,#ff3c5f,#7b2fff)',
    emoji: '🎧', seatsLeft: 350, totalSeats: 2000,
    tickets: [
      { type: 'General Entry', desc: 'Open area',       price: 2499  },
      { type: 'VIP Lounge',    desc: 'Lounge + drinks', price: 5999  },
      { type: 'Ultra VIP',     desc: 'Artist meet',     price: 12999 }
    ]
  }
];
