# ── Stage 1: Build ──────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: Production ────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install only production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built JS and migrations
COPY --from=builder /app/dist ./dist
COPY migrations ./migrations

# Create logs directory and non-root user
RUN addgroup -S azafaran && adduser -S azafaran -G azafaran \
    && mkdir -p /app/logs && chown azafaran:azafaran /app/logs
USER azafaran

EXPOSE 3000

CMD ["node", "dist/server.js"]
