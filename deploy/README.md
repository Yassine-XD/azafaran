# Azafaran — VPS Deployment Guide

## Prerequisites
- Ubuntu VPS with root access
- Domain pointing to VPS IP (optional, for SSL)

---

## Step 1: Prepare locally

Generate your `.env` file:

```bash
cd deploy
bash setup-env.sh
```

This creates `deploy/.env` with your database password, JWT secrets, and Stripe keys.

---

## Step 2: Copy project to VPS

First build the static front-ends locally:

```bash
# Admin SPA (served at /admin/)
cd admin && npm ci && npm run build && cd ..

# Marketing landing page (served at /, ES + CA + EN)
cd landing && npm ci && npm run build && cd ..

# Copy the builds next to the deploy stack so nginx can mount them
rm -rf deploy/admin deploy/landing
cp -r admin/dist   deploy/admin
cp -r landing/dist deploy/landing
```

Then ship the deploy folder (containing `admin/` + `landing/` + `backend/` + `deploy/`) to the VPS:

```bash
# From the project root (azafaran/)
scp -r backend deploy root@YOUR_VPS_IP:/opt/azafaran/
```

Or use rsync (faster for re-deploys):

```bash
rsync -avz --exclude='node_modules' --exclude='dist' --exclude='.env' \
  backend deploy root@YOUR_VPS_IP:/opt/azafaran/
scp deploy/.env root@YOUR_VPS_IP:/opt/azafaran/deploy/.env
```

---

## Step 3: Install Docker on VPS

SSH into your VPS:

```bash
ssh root@YOUR_VPS_IP
```

Then install Docker:

```bash
apt-get update && apt-get upgrade -y

# Install Docker
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify
docker --version
docker compose version
```

Configure firewall:

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## Step 4: Build and start

```bash
cd /opt/azafaran/deploy

# Build the API image
docker compose -f docker-compose.prod.yml --env-file .env build

# Start PostgreSQL first
docker compose -f docker-compose.prod.yml --env-file .env up -d postgres

# Wait ~10 seconds for DB to be ready, then run migrations
docker compose -f docker-compose.prod.yml --env-file .env run --rm api \
  npx node-pg-migrate up --migration-file-language sql

# Start everything
docker compose -f docker-compose.prod.yml --env-file .env up -d

# Verify
docker compose -f docker-compose.prod.yml ps
curl -I http://localhost/             # landing page (HTML)
curl -I http://localhost/ca/          # landing page (Catalan)
curl -I http://localhost/en/          # landing page (English)
curl -I http://localhost/admin/       # admin SPA
curl    http://localhost/api/v1/health # backend health
```

---

## Step 5: SSL with Let's Encrypt (optional, requires domain)

Make sure your domain DNS A record points to your VPS IP, then:

```bash
# Request certificate
docker compose -f docker-compose.prod.yml run --rm certbot \
  certbot certonly --webroot -w /var/www/certbot \
  --email YOUR_EMAIL --agree-tos --no-eff-email \
  -d YOUR_DOMAIN

# Edit nginx.conf — uncomment the HTTPS server block
# and replace YOUR_DOMAIN with your actual domain
nano /opt/azafaran/deploy/nginx.conf

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx
```

---

## Useful Commands

```bash
cd /opt/azafaran/deploy

# View API logs
docker compose -f docker-compose.prod.yml logs -f api

# Restart API
docker compose -f docker-compose.prod.yml restart api

# Stop everything
docker compose -f docker-compose.prod.yml down

# Rebuild after code changes
docker compose -f docker-compose.prod.yml --env-file .env build api
docker compose -f docker-compose.prod.yml --env-file .env up -d api

# Run a new migration
docker compose -f docker-compose.prod.yml --env-file .env run --rm api \
  npx node-pg-migrate up --migration-file-language sql

# Access PostgreSQL directly
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U azafaran -d azafaran

# Check disk usage
docker system df
```

---

## Stripe Webhook

After deployment, set your Stripe webhook URL in the Stripe Dashboard:

```
https://YOUR_DOMAIN/api/v1/payments/webhook
```

Events to listen for:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## Re-deploying updates

### Backend only

```bash
rsync -avz --exclude='node_modules' --exclude='dist' \
  backend/ root@YOUR_VPS_IP:/opt/azafaran/backend/

ssh root@YOUR_VPS_IP 'cd /opt/azafaran/deploy && \
  docker compose -f docker-compose.prod.yml --env-file .env build api && \
  docker compose -f docker-compose.prod.yml --env-file .env up -d api'
```

### Landing page only (marketing site)

```bash
cd landing && npm run build && cd ..
rsync -avz --delete landing/dist/ \
  root@YOUR_VPS_IP:/opt/azafaran/deploy/landing/

# Reload nginx to pick up new static files (cached files will expire via Cache-Control)
ssh root@YOUR_VPS_IP 'docker compose -f /opt/azafaran/deploy/docker-compose.prod.yml exec nginx nginx -s reload'
```

### Admin dashboard only

```bash
cd admin && npm run build && cd ..
rsync -avz --delete admin/dist/ \
  root@YOUR_VPS_IP:/opt/azafaran/deploy/admin/

ssh root@YOUR_VPS_IP 'docker compose -f /opt/azafaran/deploy/docker-compose.prod.yml exec nginx nginx -s reload'
```
