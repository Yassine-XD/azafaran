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
curl http://localhost/api/v1/health
```

---

## Step 5: SSL with Let's Encrypt

Prereq: DNS A records for both `azafaran.es` and `www.azafaran.es` must
resolve to the VPS (`187.77.169.76`). Verify from a machine outside the VPS:

```bash
dig azafaran.es @8.8.8.8 +short      # expect 187.77.169.76
dig www.azafaran.es @8.8.8.8 +short  # expect 187.77.169.76
```

Issue the certificate (the running nginx HTTP config already serves the
ACME challenge path):

```bash
cd /opt/azafaran/deploy

# Optional dry-run against the staging endpoint first:
#   add --staging to the certbot args, verify it succeeds, then delete
#   the staging cert directory before re-running without --staging:
#     docker compose -f docker-compose.prod.yml run --rm --entrypoint sh certbot \
#       -c 'rm -rf /etc/letsencrypt/live/azafaran.es* /etc/letsencrypt/archive/azafaran.es* /etc/letsencrypt/renewal/azafaran.es*.conf'

docker compose -f docker-compose.prod.yml run --rm certbot \
  certbot certonly --webroot -w /var/www/certbot \
  --email YOUR_EMAIL --agree-tos --no-eff-email \
  -d azafaran.es -d www.azafaran.es
```

Swap in the production (HTTPS) nginx config and restart:

```bash
cp nginx.prod.conf nginx.conf
docker compose -f docker-compose.prod.yml restart nginx
```

Verify from outside the VPS:

```bash
curl -I https://azafaran.es/api/v1/health    # HTTP/2 200 + HSTS header
curl -I http://azafaran.es/                  # 301 -> https://azafaran.es/
curl -I https://www.azafaran.es/api/v1/health
```

Certbot auto-renews every 12h via the sidecar container; logs:

```bash
docker compose -f docker-compose.prod.yml logs certbot
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
https://azafaran.es/api/v1/payments/webhook
```

Events to listen for:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## Re-deploying updates

From your local machine:

```bash
rsync -avz --exclude='node_modules' --exclude='dist' \
  backend/ root@YOUR_VPS_IP:/opt/azafaran/backend/

ssh root@YOUR_VPS_IP 'cd /opt/azafaran/deploy && \
  docker compose -f docker-compose.prod.yml --env-file .env build api && \
  docker compose -f docker-compose.prod.yml --env-file .env up -d api'
```
