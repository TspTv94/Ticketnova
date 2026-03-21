# 🎟️ TicketNova — Ticket Booking System

> Full-Stack 3-Tier Application | DevOps Final Project

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│            TIER 1 — PRESENTATION LAYER                  │
│   HTML5 · CSS3 · JavaScript (ES6+) · Nginx              │
│   frontend/index.html  · css/style.css · js/app.js      │
└────────────────────┬────────────────────────────────────┘
                     │  HTTP / REST API (JSON)
┌────────────────────▼────────────────────────────────────┐
│            TIER 2 — APPLICATION LAYER                   │
│   Node.js 20 · Express.js · Helmet · CORS · Morgan      │
│   backend/src/ (controllers · routes · middleware)      │
└────────────────────┬────────────────────────────────────┘
                     │  Read / Write
┌────────────────────▼────────────────────────────────────┐
│            TIER 3 — DATA LAYER                          │
│   In-Memory Store (JS arrays) → upgradeable to MongoDB  │
│   backend/src/models/                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
ticketnova/
│
├── frontend/                       ← Tier 1: Presentation Layer
│   ├── index.html                  ← Main HTML page
│   ├── css/
│   │   └── style.css               ← All styles (dark theme, animations)
│   └── js/
│       ├── api.js                  ← API service layer (fetch calls)
│       └── app.js                  ← App logic (render, booking, filter)
│
├── backend/                        ← Tier 2: Application Layer
│   ├── server.js                   ← HTTP server entry point
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── app.js                  ← Express app setup
│   │   ├── controllers/
│   │   │   ├── eventsController.js
│   │   │   ├── bookingsController.js
│   │   │   └── statsController.js
│   │   ├── routes/
│   │   │   ├── events.js
│   │   │   └── bookings.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── logger.js
│   │   └── models/                 ← Tier 3: Data Layer
│   │       ├── events.js           ← In-memory events store
│   │       └── bookings.js         ← In-memory bookings store
│   └── tests/
│       └── api.test.js             ← Jest + Supertest API tests
│
├── nginx/
│   └── nginx.conf                  ← Reverse proxy configuration
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml               ← GitHub Actions CI/CD pipeline
│
├── Dockerfile                      ← Multi-stage production build
├── docker-compose.yml              ← Production stack
├── docker-compose.dev.yml          ← Development override
├── .dockerignore
├── .gitignore
└── README.md
```

---

## 🚀 Running the Project

### Option 1 — Run Locally (No Docker)
```bash
# Install backend deps
cd backend && npm install

# Start backend (serves frontend too)
npm run dev

# Open browser → http://localhost:3000
```

### Option 2 — Docker (Single Container)
```bash
# Build the image
docker build -t ticketnova:latest .

# Run the container
docker run -d -p 3000:3000 --name ticketnova ticketnova:latest

# Open browser → http://localhost:3000

# Check logs
docker logs -f ticketnova

# Health check
curl http://localhost:3000/health
```

### Option 3 — Docker Compose (Full Stack with Nginx)
```bash
# Start everything (app + nginx)
docker compose up -d

# Open browser → http://localhost:80

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

### Option 4 — Development Mode (Hot Reload)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
# App: http://localhost:8080
# Backend direct: http://localhost:3000
```

---

## 🔌 REST API Reference

| Method | Endpoint                    | Description                 |
|--------|-----------------------------|-----------------------------|
| GET    | `/health`                   | Health check                |
| GET    | `/api/events`               | List all events             |
| GET    | `/api/events?category=music`| Filter by category          |
| GET    | `/api/events/:id`           | Get single event            |
| GET    | `/api/events/categories`    | Get all categories          |
| POST   | `/api/bookings`             | Create a booking            |
| GET    | `/api/bookings`             | List all bookings           |
| GET    | `/api/bookings?email=x`     | Filter bookings by email    |
| GET    | `/api/bookings/:id`         | Get booking by ID           |
| DELETE | `/api/bookings/:id`         | Cancel a booking            |
| GET    | `/api/stats`                | Platform statistics         |

### Sample: Create Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "customer": {
      "firstName": "Rahul",
      "lastName":  "Sharma",
      "email":     "rahul@example.com",
      "phone":     "+91 98765 43210",
      "city":      "Mumbai"
    },
    "tickets": [
      { "type": "Gold", "qty": 2 }
    ]
  }'
```

---

## 🧪 Running Tests
```bash
cd backend
npm test                  # Run all tests once
npm run test:watch        # Watch mode
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

| Stage             | Trigger              | What it does                          |
|-------------------|----------------------|---------------------------------------|
| 🧪 Test           | Every push / PR      | npm ci → Jest tests                   |
| 🐳 Build & Push   | Push to any branch   | Docker build → push to GHCR           |
| 🔒 Security Scan  | After build          | Trivy scans image for CVEs            |
| 🚀 Deploy Staging | Push to `develop`    | SSH deploy to staging server          |
| 🌍 Deploy Prod    | Push to `main`       | SSH deploy to production server       |

### Required GitHub Secrets
| Secret            | Description                      |
|-------------------|----------------------------------|
| `STAGING_HOST`    | Staging server IP or hostname    |
| `STAGING_USER`    | SSH username                     |
| `STAGING_SSH_KEY` | Private SSH key (RSA/Ed25519)    |
| `PROD_HOST`       | Production server IP             |
| `PROD_USER`       | SSH username                     |
| `PROD_SSH_KEY`    | Private SSH key                  |

---

## 🛠️ Tech Stack Summary

| Tier       | Technology         | Purpose                        |
|------------|--------------------|--------------------------------|
| Tier 1     | HTML5              | Page structure                 |
| Tier 1     | CSS3               | Styling, animations, layout    |
| Tier 1     | JavaScript (ES6+)  | Interactivity, API calls       |
| Tier 2     | Node.js 20         | JavaScript runtime             |
| Tier 2     | Express.js         | REST API framework             |
| Tier 2     | Helmet             | HTTP security headers          |
| Tier 2     | CORS               | Cross-origin policy            |
| Tier 2     | Morgan             | Request logging                |
| Tier 3     | In-Memory (JS)     | Data store (MVP)               |
| Tier 3     | MongoDB (upgrade)  | Production database            |
| DevOps     | Docker             | Containerisation               |
| DevOps     | Docker Compose     | Multi-container orchestration  |
| DevOps     | Nginx              | Reverse proxy, static files    |
| DevOps     | GitHub Actions     | CI/CD automation               |
| DevOps     | Trivy              | Container security scanning    |
| DevOps     | GHCR               | Docker image registry          |

---

*TicketNova — DevOps Final Project*
