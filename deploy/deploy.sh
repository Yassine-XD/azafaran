#!/usr/bin/env bash
set -euo pipefail

# ================================================================
#  Azafaran Backend — VPS Deployment Script
#  Deploys: PostgreSQL 15 + Node.js API + Nginx + Let's Encrypt
#  Target: Ubuntu VPS with root access
# ================================================================

# ── Configuration ─────────────────────────────────────
VPS_USER="root"
VPS_IP="187.77.169.76"
VPS_SSH="${VPS_USER}@${VPS_IP}"
REMOTE_DIR="/opt/azafaran"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[x]${NC} $1"; exit 1; }
ask()  { echo -e "${CYAN}[?]${NC} $1"; }

# ── Pre-flight checks ────────────────────────────────
command -v ssh  >/dev/null || err "ssh not found"
command -v scp  >/dev/null || err "scp not found"
command -v rsync >/dev/null || err "rsync not found"

# ── Collect secrets ───────────────────────────────────
echo ""
echo "======================================"
echo "   AZAFARAN — VPS DEPLOYMENT SETUP"
echo "======================================"
echo ""

# Check if .env.prod already exists
if [ -f "${REPO_ROOT}/deploy/.env.prod" ]; then
    ask "Found existing .env.prod — use it? (y/n)"
    read -r USE_EXISTING
    if [ "$USE_EXISTING" = "y" ]; then
        source "${REPO_ROOT}/deploy/.env.prod"
    fi
fi

if [ -z "${DB_PASSWORD:-}" ]; then
    ask "Database password for PostgreSQL:"
    read -rs DB_PASSWORD
    echo ""
fi

if [ -z "${JWT_ACCESS_SECRET:-}" ]; then
    log "Generating JWT secrets..."
    JWT_ACCESS_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    log "JWT secrets generated (64 chars each)"
fi

ask "Stripe Secret Key (sk_test_... or sk_live_..., press Enter to skip):"
read -r STRIPE_SK
STRIPE_SK="${STRIPE_SK:-}"

ask "Stripe Webhook Secret (whsec_..., press Enter to skip):"
read -r STRIPE_WH
STRIPE_WH="${STRIPE_WH:-}"

ask "Domain name (e.g. api.azafaran.es, press Enter to skip for IP-only):"
read -r DOMAIN
DOMAIN="${DOMAIN:-}"

if [ -n "$DOMAIN" ]; then
    CLIENT_URL="https://${DOMAIN}"
else
    CLIENT_URL="http://${VPS_IP}"
fi

# Save .env.prod locally for reuse
cat > "${REPO_ROOT}/deploy/.env.prod" << ENVEOF
DB_USER=azafaran
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=azafaran
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
CLIENT_URL=${CLIENT_URL}
STRIPE_SECRET_KEY=${STRIPE_SK}
STRIPE_WEBHOOK_SECRET=${STRIPE_WH}
DOMAIN=${DOMAIN}
ENVEOF
chmod 600 "${REPO_ROOT}/deploy/.env.prod"
log "Saved .env.prod locally (chmod 600)"

# ── Step 1: Prepare VPS ──────────────────────────────
log "Connecting to VPS and installing Docker..."
ssh -o StrictHostKeyChecking=accept-new "${VPS_SSH}" bash << 'REMOTE_SETUP'
set -euo pipefail

echo "[+] Updating system..."
apt-get update -qq
apt-get upgrade -y -qq

# Install Docker if not present
if ! command -v docker &>/dev/null; then
    echo "[+] Installing Docker..."
    apt-get install -y -qq ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "[+] Docker installed!"
else
    echo "[+] Docker already installed"
fi

# Install rsync if not present
apt-get install -y -qq rsync

# Firewall
if command -v ufw &>/dev/null; then
    echo "[+] Configuring firewall..."
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
fi

# Create project directory
mkdir -p /opt/azafaran
echo "[+] VPS ready!"
REMOTE_SETUP

# ── Step 2: Sync files to VPS ────────────────────────
log "Syncing project files to VPS..."

# Sync backend source
rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.env' \
    --exclude='.env.*' \
    "${REPO_ROOT}/backend/" "${VPS_SSH}:${REMOTE_DIR}/backend/"

# Sync deploy config
rsync -avz "${REPO_ROOT}/deploy/docker-compose.prod.yml" "${VPS_SSH}:${REMOTE_DIR}/"
rsync -avz "${REPO_ROOT}/deploy/nginx.conf" "${VPS_SSH}:${REMOTE_DIR}/"

# Send .env file
scp "${REPO_ROOT}/deploy/.env.prod" "${VPS_SSH}:${REMOTE_DIR}/.env"
log "Files synced!"

# ── Step 3: Build and start ──────────────────────────
log "Building and starting containers on VPS..."

# If domain is set, update nginx.conf on remote
if [ -n "$DOMAIN" ]; then
    ssh "${VPS_SSH}" "sed -i 's/YOUR_DOMAIN/${DOMAIN}/g' ${REMOTE_DIR}/nginx.conf"
fi

ssh "${VPS_SSH}" bash << REMOTE_START
set -euo pipefail
cd ${REMOTE_DIR}

echo "[+] Building Docker images..."
docker compose -f docker-compose.prod.yml --env-file .env build --no-cache

echo "[+] Starting PostgreSQL..."
docker compose -f docker-compose.prod.yml --env-file .env up -d postgres
echo "[+] Waiting for PostgreSQL to be healthy..."
sleep 5

# Wait for postgres to be healthy
for i in \$(seq 1 30); do
    if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U \${DB_USER:-azafaran} > /dev/null 2>&1; then
        echo "[+] PostgreSQL is ready!"
        break
    fi
    echo "    Waiting... (\$i/30)"
    sleep 2
done

echo "[+] Running database migrations..."
docker compose -f docker-compose.prod.yml --env-file .env run --rm api \
    npx node-pg-migrate up --migration-file-language sql

echo "[+] Starting all services..."
docker compose -f docker-compose.prod.yml --env-file .env up -d

echo ""
echo "[+] Checking containers..."
docker compose -f docker-compose.prod.yml ps
REMOTE_START

# ── Step 4: SSL setup (if domain provided) ──────────
if [ -n "$DOMAIN" ]; then
    log "Setting up SSL certificate for ${DOMAIN}..."
    ask "Make sure ${DOMAIN} DNS points to ${VPS_IP}. Ready? (y/n)"
    read -r DNS_READY
    if [ "$DNS_READY" = "y" ]; then
        ask "Email for Let's Encrypt notifications:"
        read -r LE_EMAIL
        ssh "${VPS_SSH}" bash << SSLSETUP
set -euo pipefail
cd ${REMOTE_DIR}

echo "[+] Requesting SSL certificate..."
docker compose -f docker-compose.prod.yml run --rm certbot \
    certbot certonly --webroot -w /var/www/certbot \
    --email ${LE_EMAIL} --agree-tos --no-eff-email \
    -d ${DOMAIN}

echo "[+] Enabling HTTPS in nginx..."
# Uncomment the HTTPS server block
sed -i '/# server {/,/# }/ s/^    # /    /' ${REMOTE_DIR}/nginx.conf
# Enable HTTP->HTTPS redirect
sed -i 's|# return 301 https://\$host\$request_uri;|return 301 https://\$host\$request_uri;|' ${REMOTE_DIR}/nginx.conf
# Comment out the HTTP proxy block
sed -i '/return 301/,/}/ { /location \//,/}/ s/^/        # / }' ${REMOTE_DIR}/nginx.conf || true

echo "[+] Reloading nginx..."
docker compose -f docker-compose.prod.yml restart nginx

echo "[+] SSL setup complete!"
SSLSETUP
    else
        warn "Skipping SSL. Run the SSL step manually later."
    fi
fi

# ── Step 5: Verify ───────────────────────────────────
echo ""
log "Verifying deployment..."
sleep 3

if [ -n "$DOMAIN" ]; then
    HEALTH_URL="https://${DOMAIN}/api/v1/health"
else
    HEALTH_URL="http://${VPS_IP}/api/v1/health"
fi

if curl -sf "${HEALTH_URL}" > /dev/null 2>&1; then
    RESPONSE=$(curl -s "${HEALTH_URL}")
    log "API is live!"
    echo "  ${RESPONSE}"
else
    warn "Health check failed. Check logs with:"
    echo "  ssh ${VPS_SSH} 'cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml logs api'"
fi

# ── Done ─────────────────────────────────────────────
echo ""
echo "======================================"
echo "   DEPLOYMENT COMPLETE"
echo "======================================"
echo ""
echo "  API:      ${HEALTH_URL}"
echo "  VPS:      ssh ${VPS_SSH}"
echo "  Logs:     ssh ${VPS_SSH} 'cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml logs -f api'"
echo "  Restart:  ssh ${VPS_SSH} 'cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml restart api'"
echo "  Status:   ssh ${VPS_SSH} 'cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml ps'"
echo ""

if [ -n "${STRIPE_SK}" ]; then
    echo "  Stripe webhook URL: ${HEALTH_URL%/health}payments/webhook"
    echo "  Set this in your Stripe Dashboard > Developers > Webhooks"
    echo ""
fi

echo "  IMPORTANT: Update your React Native app API_BASE_URL to:"
echo "  ${CLIENT_URL}/api"
echo ""
