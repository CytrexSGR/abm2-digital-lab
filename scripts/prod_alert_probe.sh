#!/usr/bin/env bash
set -euo pipefail

URL=${BACKEND_URL:-http://127.0.0.1:8000}

mkdir -p runs

BEFORE=$(curl -fsS "$URL/metrics" | grep -E 'audit_failed_total|pin_update_rejected_total' || true)

# Trigger RBAC 403 (no role)
curl -s -o /dev/null -w "%{http_code}\n" -X PUT "$URL/api/pins" -H 'Content-Type: application/json' -d '{"pins":{"altruism_update":"1.0.0"}}'

# Trigger invalid pin (operator)
curl -s -o /dev/null -w "%{http_code}\n" -X PUT "$URL/api/pins" -H 'Content-Type: application/json' -H 'X-User-Role: operator' -d '{"pins":{"altruism_update":"9.9.9"}}' || true

AFTER=$(curl -fsS "$URL/metrics" | grep -E 'audit_failed_total|pin_update_rejected_total' || true)

echo "$BEFORE" > runs/alert_probe_before.txt
echo "$AFTER" > runs/alert_probe_after.txt
echo "Alert probe completed."

