#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then echo "Usage: $0 <formula>@<version>"; exit 2; fi
FML=${1%@*}; VER=${1#*@}
URL=${BACKEND_URL:-http://127.0.0.1:8000}

echo "Rollback: setting pin $FML@$VER"
CURR=$(curl -fsS "$URL/api/pins" | jq -c '.pins')
NEW=$(echo "$CURR" | jq -c --arg f "$FML" --arg v "$VER" '. + {($f):$v}')
curl -fsS -X PUT "$URL/api/pins" -H 'Content-Type: application/json' -H 'X-User-Role: operator' -d '{"pins":'$NEW'}'
# Write audit marker
curl -fsS -X POST "$URL/api/audit/mark" -H 'Content-Type: application/json' -H 'X-User-Role: operator' -d '{"action":"rollback_initiated","formula":"'$FML'","version":"'$VER'"}'
# Reset model
curl -fsS -X POST "$URL/api/simulation/reset" -H 'Content-Type: application/json' -d '{"num_agents":100,"network_connections":5}' >/dev/null
echo "Rollback completed."

