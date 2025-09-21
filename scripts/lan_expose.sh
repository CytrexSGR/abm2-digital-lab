#!/usr/bin/env bash
set -euo pipefail

# Set your LAN IP here (example)
HOST_IP="192.168.178.55"   # <<< HIER deine LAN-IP einsetzen

if [[ "$HOST_IP" == "192.168.0.42" ]]; then
  echo "Bitte HOST_IP in scripts/lan_expose.sh auf deine LAN-IP setzen." >&2
fi

# 1) .env.prod anpassen (ALLOWED_ORIGINS auf IP fixieren)
if grep -q '^ALLOWED_ORIGINS=' .env.prod; then
  sed -i.bak -E "s#^ALLOWED_ORIGINS=.*#ALLOWED_ORIGINS=http://$HOST_IP,http://$HOST_IP:3000#g" .env.prod
else
  echo "ALLOWED_ORIGINS=http://$HOST_IP,http://$HOST_IP:3000" >> .env.prod
fi

echo "== .env.prod =="
grep -E '^(ALLOWED_ORIGINS|BACKEND_PORT|FRONTEND_PORT|FORMULA_REGISTRY_ENABLED|REGISTRY_RBAC_MODE)' .env.prod || true

# 2) Compose Build & Up
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# 3) Optional: Firewall (Linux/UFW)
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 80/tcp || true
  sudo ufw allow 8000/tcp || true
fi

# 4) Health/Proxy Checks
echo "== Health (Backend) =="
if command -v jq >/dev/null 2>&1; then
  curl -fsS "http://$HOST_IP:8000/api/registry/health" | jq .
else
  curl -fsS "http://$HOST_IP:8000/api/registry/health"
fi

echo "== Proxy (Frontend→Backend) =="
if command -v jq >/dev/null 2>&1; then
  curl -fsS "http://$HOST_IP/api/registry/health" | jq . || true
else
  curl -fsS "http://$HOST_IP/api/registry/health" || true
fi

echo "== Frontend HEAD =="
curl -I "http://$HOST_IP" | head -n 1 || true

echo "Done. Öffne http://$HOST_IP im Browser."
