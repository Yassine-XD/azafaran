#!/usr/bin/env bash
set -euo pipefail

# ================================================================
#  Azafaran — pre-flight check for nginx static dirs
#  Verifies deploy/landing/ and deploy/admin/ are populated.
#  Empty bind-mount dirs cause nginx to return 403/404.
# ================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

fail() {
    echo "[X] $1" >&2
    cat >&2 <<'EOF'

Build the static front-ends and copy them into deploy/ before bringing the stack up:

    cd admin   && npm ci && npm run build && cd ..
    cd landing && npm ci && npm run build && cd ..
    rm -rf deploy/admin deploy/landing
    cp -r admin/dist   deploy/admin
    cp -r landing/dist deploy/landing

Then re-run this script.
EOF
    exit 1
}

check() {
    local path="$1"
    [ -f "$path" ] || fail "missing: $path"
    [ -s "$path" ] || fail "empty: $path"
}

check "${SCRIPT_DIR}/landing/index.html"
check "${SCRIPT_DIR}/admin/index.html"

echo "[+] static dirs OK (landing + admin)"
