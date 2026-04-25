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

echo "[?] Public site domain (e.g. azafaran.es — apex and www are both auto-allowed by CORS, Enter to skip):"
read -r DOMAIN

CORS_ORIGINS=""
if [ -n "$DOMAIN" ]; then
    CLIENT_URL="https://${DOMAIN}"
    if [ "${DOMAIN#www.}" != "$DOMAIN" ]; then
        APEX="${DOMAIN#www.}"
        CORS_ORIGINS="https://${DOMAIN},https://${APEX}"
    else
        CORS_ORIGINS="https://${DOMAIN},https://www.${DOMAIN}"
    fi
    echo "[+] CORS_ORIGINS=${CORS_ORIGINS}"
else
    CLIENT_URL="http://YOUR_VPS_IP"
fi

echo "[?] SMTP Host (e.g. smtp.gmail.com, Enter to skip email):"
read -r SMTP_HOST

if [ -n "$SMTP_HOST" ]; then
    echo "[?] SMTP Port (587 for STARTTLS, 465 for SSL):"
    read -r SMTP_PORT

    echo "[?] SMTP User (e.g. noreply@azafaran.es):"
    read -r SMTP_USER

    echo "[?] SMTP Password / App Password:"
    read -rs SMTP_PASS
    echo ""

    echo "[?] SMTP From header (e.g. Azafaran <noreply@azafaran.es>, Enter to use SMTP_USER):"
    read -r SMTP_FROM

    echo "[?] Admin email (receives new-order notifications, Enter to skip):"
    read -r ADMIN_EMAIL
fi

cat > "${SCRIPT_DIR}/.env" << EOF
DB_USER=azafaran
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=azafaran
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
CLIENT_URL=${CLIENT_URL}
CORS_ORIGINS=${CORS_ORIGINS:-}
STRIPE_SECRET_KEY=${STRIPE_SK:-}
STRIPE_WEBHOOK_SECRET=${STRIPE_WH:-}
DOMAIN=${DOMAIN:-}
SMTP_HOST=${SMTP_HOST:-}
SMTP_PORT=${SMTP_PORT:-}
SMTP_USER=${SMTP_USER:-}
SMTP_PASS=${SMTP_PASS:-}
SMTP_FROM=${SMTP_FROM:-}
ADMIN_EMAIL=${ADMIN_EMAIL:-}
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
