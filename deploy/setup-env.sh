#!/usr/bin/env bash
set -euo pipefail

# ================================================================
#  Azafaran Backend — Generate .env for production
#  Run this locally, then copy the deploy/ folder to your VPS
# ================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "======================================"
echo "   AZAFARAN — GENERATE PRODUCTION ENV"
echo "======================================"
echo ""

# Check if .env already exists
if [ -f "${SCRIPT_DIR}/.env" ]; then
    echo "[!] .env already exists. Overwrite? (y/n)"
    read -r OVERWRITE
    [ "$OVERWRITE" != "y" ] && echo "Aborted." && exit 0
fi

echo "[?] Database password:"
read -rs DB_PASSWORD
echo ""

echo "[+] Generating JWT secrets..."
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

echo "[?] Stripe Secret Key (sk_test_... or sk_live_..., Enter to skip):"
read -r STRIPE_SK

echo "[?] Stripe Webhook Secret (whsec_..., Enter to skip):"
read -r STRIPE_WH

echo "[?] Domain name (e.g. api.azafaran.es, Enter to skip):"
read -r DOMAIN

if [ -n "$DOMAIN" ]; then
    CLIENT_URL="https://${DOMAIN}"
else
    CLIENT_URL="http://YOUR_VPS_IP"
fi

cat > "${SCRIPT_DIR}/.env" << EOF
DB_USER=azafaran
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=azafaran
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
CLIENT_URL=${CLIENT_URL}
STRIPE_SECRET_KEY=${STRIPE_SK:-}
STRIPE_WEBHOOK_SECRET=${STRIPE_WH:-}
DOMAIN=${DOMAIN:-}
EOF

chmod 600 "${SCRIPT_DIR}/.env"

echo ""
echo "[+] .env generated at: ${SCRIPT_DIR}/.env"
echo ""
echo "Next steps:"
echo "  1. Copy the whole project to your VPS:"
echo "     scp -r $(dirname "$SCRIPT_DIR") root@YOUR_VPS_IP:/opt/azafaran"
echo ""
echo "  2. SSH into VPS and follow deploy/README.md"
echo ""
