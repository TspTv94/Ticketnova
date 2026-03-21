# ── Stage 1: Builder ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm prune --omit=dev

# ── Stage 2: Production ──────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache wget curl

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/src          ./src
COPY --from=builder --chown=appuser:appgroup /app/server.js    ./server.js
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

# Copy frontend into /app/frontend (same level as backend src)
COPY --chown=appuser:appgroup frontend/ ./frontend/

USER appuser

EXPOSE 3000

HEALTHCHECK \
  --interval=10s \
  --timeout=5s \
  --start-period=20s \
  --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
