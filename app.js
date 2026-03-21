/**
 * TicketNova — Main Application Logic
 * File: frontend/js/app.js
 *
 * Handles: rendering, modals, booking, tickets, filters, animations
 * Depends on: api.js (loaded first in HTML)
 */

/* ── State ──────────────────────────────────────────────────── */
let allEvents    = [];
let currentEvent = null;
let quantities   = {};
let myTickets    = JSON.parse(localStorage.getItem('tn_tickets') || '[]');

/* ── Init ───────────────────────────────────────────────────── */
window.addEventListener('load', async () => {
  // Hide loader after short delay
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    initScrollAnimations();
    animateCounters();
  }, 1400);

  // Load events from API (or local fallback)
  allEvents = await ApiService.getEvents('all');
  renderEvents(allEvents);
  renderMyTickets();
});

/* ── Render Events ──────────────────────────────────────────── */
function renderEvents(events) {
  const grid = document.getElementById('events-grid');
  grid.innerHTML = '';

  if (!events.length) {
    grid.innerHTML = '<div class="loading-events">No events found in this category.</div>';
    return;
  }

  events.forEach((ev, i) => {
    const soldOut  = ev.seatsLeft === 0;
    const minPrice = Math.min(...ev.tickets.map(t => t.price));
    const isFeatured = i === 0 && ev.featured;

    const card = document.createElement('div');
    card.className = `event-card reveal${isFeatured ? ' featured' : ''}`;

    card.innerHTML = `
      <div class="card-img">
        <div class="card-img-emoji" style="background:${ev.gradient};">${ev.emoji}</div>
        <div class="card-img-overlay"></div>
        <div class="card-badge badge-${ev.category}">${capitalize(ev.category)}</div>
        ${soldOut ? '<div class="card-badge badge-soldout" style="top:auto;bottom:16px;">SOLD OUT</div>' : ''}
        <div class="card-price">from ₹${minPrice.toLocaleString('en-IN')}</div>
      </div>
      <div class="card-body">
        <div class="card-date">${ev.date} · ${ev.time}</div>
        <div class="card-title">${ev.title}</div>
        <div class="card-venue">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          ${ev.venue}
        </div>
        <div class="card-footer">
          <div class="seats-left">
            ${soldOut
              ? '<span style="color:var(--accent);">Fully Booked</span>'
              : `<strong>${ev.seatsLeft}</strong> seats left`}
          </div>
          <button class="book-btn" onclick="openModal(${ev.id})" ${soldOut ? 'disabled' : ''}>
            ${soldOut ? 'Sold Out' : 'Book Now →'}
          </button>
        </div>
      </div>`;

    grid.appendChild(card);
    // Staggered reveal
    setTimeout(() => card.classList.add('visible'), 80 + i * 80);
  });
}

/* ── Filter Events ──────────────────────────────────────────── */
function filterEvents(category, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const filtered = category === 'all'
    ? allEvents
    : allEvents.filter(e => e.category === category);
  renderEvents(filtered);
}

function filterAll() {
  document.querySelector('.tab').click();
}

/* ── Modal: Open ────────────────────────────────────────────── */
function openModal(id) {
  currentEvent = allEvents.find(e => e.id === id);
  if (!currentEvent) return;
  quantities = {};
  currentEvent.tickets.forEach((_, i) => quantities[i] = 0);

  document.getElementById('modal-title').textContent  = currentEvent.title;
  document.getElementById('modal-badge').textContent  = capitalize(currentEvent.category);
  document.getElementById('modal-badge').className    = `card-badge badge-${currentEvent.category}`;
  document.getElementById('modal-date').textContent   = currentEvent.date;
  document.getElementById('modal-venue').textContent  = currentEvent.venue;
  document.getElementById('modal-time').textContent   = currentEvent.time;

  const imgBg = document.getElementById('modal-img-bg');
  imgBg.style.background = currentEvent.gradient;
  imgBg.textContent = currentEvent.emoji;

  renderTicketTypes();
  updateSummary();
  clearForm();

  document.getElementById('booking-view').style.display = 'block';
  document.getElementById('success-view').classList.remove('show');
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ── Modal: Close ───────────────────────────────────────────── */
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

/* ── Render Ticket Type Rows ────────────────────────────────── */
function renderTicketTypes() {
  const container = document.getElementById('ticket-types-container');
  container.innerHTML = '';
  currentEvent.tickets.forEach((t, i) => {
    container.innerHTML += `
      <div class="ticket-type">
        <div class="ticket-info">
          <h4>${t.type}</h4>
          <p>${t.desc}</p>
        </div>
        <div class="ticket-price">₹${t.price.toLocaleString('en-IN')}</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
          <span class="qty-num" id="qty-${i}">0</span>
          <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
        </div>
      </div>`;
  });
}

/* ── Qty Control ────────────────────────────────────────────── */
function changeQty(i, delta) {
  quantities[i] = Math.max(0, Math.min(10, (quantities[i] || 0) + delta));
  document.getElementById(`qty-${i}`).textContent = quantities[i];
  updateSummary();
}

/* ── Update Order Summary ───────────────────────────────────── */
function updateSummary() {
  let subtotal = 0;
  currentEvent.tickets.forEach((t, i) => subtotal += t.price * (quantities[i] || 0));
  const fee   = Math.round(subtotal * 0.03);
  const total = subtotal + fee;

  document.getElementById('subtotal').textContent    = `₹${subtotal.toLocaleString('en-IN')}`;
  document.getElementById('booking-fee').textContent = `₹${fee.toLocaleString('en-IN')}`;
  document.getElementById('total-price').textContent = `₹${total.toLocaleString('en-IN')}`;
  document.getElementById('btn-amount').textContent  = total > 0 ? `— ₹${total.toLocaleString('en-IN')}` : '';
  document.getElementById('checkout-btn').disabled   = total === 0;
}

/* ── Process Booking ────────────────────────────────────────── */
async function processBooking() {
  const fname  = document.getElementById('fname').value.trim();
  const lname  = document.getElementById('lname').value.trim();
  const email  = document.getElementById('email').value.trim();
  const phone  = document.getElementById('phone').value.trim();
  const city   = document.getElementById('city').value.trim();
  const card   = document.getElementById('card').value.replace(/\s/g, '');
  const expiry = document.getElementById('expiry').value.trim();
  const cvv    = document.getElementById('cvv').value.trim();

  // Validation
  if (!fname || !lname || !email || !phone) {
    showToast('⚠️', 'Missing Details', 'Please fill in all required fields.'); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('⚠️', 'Invalid Email', 'Please enter a valid email address.'); return;
  }
  if (card.length < 16 || isNaN(card)) {
    showToast('⚠️', 'Invalid Card', 'Please enter a valid 16-digit card number.'); return;
  }
  if (expiry.length < 5) {
    showToast('⚠️', 'Invalid Expiry', 'Please enter a valid MM/YY expiry.'); return;
  }
  if (cvv.length < 3) {
    showToast('⚠️', 'Invalid CVV', 'Please enter a valid 3-digit CVV.'); return;
  }

  const selectedTickets = currentEvent.tickets
    .map((t, i) => quantities[i] > 0 ? { type: t.type, qty: quantities[i] } : null)
    .filter(Boolean);

  if (!selectedTickets.length) {
    showToast('⚠️', 'No Tickets', 'Please select at least one ticket.'); return;
  }

  const btn = document.getElementById('checkout-btn');
  btn.textContent = 'Processing…';
  btn.disabled = true;

  const payload = {
    eventId: currentEvent.id,
    customer: { firstName: fname, lastName: lname, email, phone, city },
    tickets: selectedTickets,
  };

  // Call API
  const result = await ApiService.createBooking(payload);

  if (result.success) {
    // Build a full local booking record for My Tickets
    let subtotal = 0;
    currentEvent.tickets.forEach((t, i) => subtotal += t.price * (quantities[i] || 0));
    const fee = Math.round(subtotal * 0.03);

    const booking = {
      id:         result.data.id,
      eventId:    currentEvent.id,
      eventTitle: currentEvent.title,
      eventDate:  currentEvent.date,
      eventTime:  currentEvent.time,
      venue:      currentEvent.venue,
      gradient:   currentEvent.gradient,
      emoji:      currentEvent.emoji,
      category:   currentEvent.category,
      customer:   { firstName: fname, lastName: lname, email, phone, city },
      tickets:    currentEvent.tickets
        .map((t, i) => quantities[i] > 0 ? { type: t.type, qty: quantities[i], price: t.price } : null)
        .filter(Boolean),
      subtotal, bookingFee: fee, total: subtotal + fee,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };

    // Persist to localStorage
    myTickets.push(booking);
    localStorage.setItem('tn_tickets', JSON.stringify(myTickets));
    renderMyTickets();

    document.getElementById('ticket-id-display').textContent = booking.id;
    document.getElementById('booking-view').style.display = 'none';
    document.getElementById('success-view').classList.add('show');
    showToast('🎟️', 'Booking Confirmed!', `Ticket ID: ${booking.id}`);
  } else {
    showToast('❌', 'Booking Failed', 'Please try again later.');
  }

  btn.textContent = 'Confirm & Pay';
  btn.disabled = false;
}

/* ── Render My Tickets ──────────────────────────────────────── */
function renderMyTickets() {
  const list = document.getElementById('tickets-list');
  if (!myTickets.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎟️</div>
        <p>No tickets booked yet.<br>Browse events and book your first experience!</p>
      </div>`;
    return;
  }
  list.innerHTML = myTickets.slice().reverse().map(t => `
    <div class="my-ticket">
      <div class="ticket-stripe"></div>
      <div class="ticket-emoji" style="background:${t.gradient};">${t.emoji}</div>
      <div class="ticket-details">
        <div class="ticket-name">${t.eventTitle}</div>
        <div class="ticket-sub">${t.eventDate} · ${t.eventTime}</div>
        <div class="ticket-sub">${t.venue}</div>
        <div class="ticket-meta">
          ${t.tickets.map(tk => `${tk.qty}× ${tk.type}`).join(' | ')} &nbsp;·&nbsp;
          <span style="color:var(--gold);font-family:'Space Mono',monospace;">₹${t.total.toLocaleString('en-IN')}</span>
        </div>
        <div class="ticket-id-tag">${t.id}</div>
      </div>
      <div class="ticket-qr">
        <svg viewBox="0 0 64 64" width="50" height="50">${generateQR()}</svg>
      </div>
      <div class="ticket-status status-confirmed">✓ Confirmed</div>
    </div>`).join('');
}

/* ── Section Nav ─────────────────────────────────────────────── */
function showSection(sec) {
  const evtSec   = document.getElementById('events');
  const tickSec  = document.getElementById('my-tickets');
  const statsBar = document.querySelector('.stats-bar');
  const hero     = document.getElementById('home');

  if (sec === 'events') {
    evtSec.style.display   = 'block';
    statsBar.style.display = 'flex';
    hero.style.display     = 'flex';
    tickSec.classList.remove('visible');
    evtSec.scrollIntoView({ behavior: 'smooth' });
  } else {
    evtSec.style.display   = 'none';
    statsBar.style.display = 'none';
    hero.style.display     = 'none';
    tickSec.classList.add('visible');
    renderMyTickets();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ── Counter Animation ──────────────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      if (target >= 1000000) el.textContent = (current / 1000000).toFixed(1) + 'M+';
      else if (target >= 1000) el.textContent = Math.floor(current / 1000) + 'K+';
      else el.textContent = Math.floor(current) + (target === 99 ? '%' : '+');
      if (current >= target) clearInterval(timer);
    }, 25);
  });
}

/* ── Scroll Reveal ──────────────────────────────────────────── */
function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── Toast ──────────────────────────────────────────────────── */
function showToast(icon, title, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-icon').textContent  = icon;
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent   = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}

/* ── Input Formatters ───────────────────────────────────────── */
function formatCard(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 16);
  el.value = v.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
  el.value = v;
}

/* ── Helpers ────────────────────────────────────────────────── */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function clearForm() {
  ['fname','lname','email','phone','city','card','expiry','cvv'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}
function generateQR() {
  let rects = '';
  const s = 8, g = 1;
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
    if (Math.random() > 0.45) {
      rects += `<rect x="${c*(s+g)+1}" y="${r*(s+g)+1}" width="${s}" height="${s}" fill="var(--text)" rx="1"/>`;
    }
  }
  return rects;
}
