#!/usr/bin/env bash
set -euo pipefail

URL=${BACKEND_URL:-http://127.0.0.1:8000}

run_case() {
  local agents=$1; local steps=$2; local label=$3
  echo "Synthetic load: $label ($agents x $steps)"
  # snapshot before
  curl -fsS "$URL/metrics" > runs/metrics_before_${label}.txt || true
  # baseline
  curl -fsS -X PUT "$URL/api/pins" -H 'Content-Type: application/json' -H 'X-User-Role: operator' -d '{"pins":{}}'
  curl -fsS -X POST "$URL/api/simulation/reset" -H 'Content-Type: application/json' -d '{"num_agents":'"$agents"',"network_connections":5}' >/dev/null
  T0=$(date +%s%3N); for i in $(seq 1 "$steps"); do curl -fsS -X POST "$URL/api/simulation/step" >/dev/null; done; T1=$(date +%s%3N)
  # registry
  CURR=$(curl -fsS "$URL/api/pins" | jq -c '.pins')
  curl -fsS -X PUT "$URL/api/pins" -H 'Content-Type: application/json' -H 'X-User-Role: operator' -d '{"pins":'$CURR'}'
  curl -fsS -X POST "$URL/api/simulation/reset" -H 'Content-Type: application/json' -d '{"num_agents":'"$agents"',"network_connections":5}' >/dev/null
  T2=$(date +%s%3N); for i in $(seq 1 "$steps"); do curl -fsS -X POST "$URL/api/simulation/step" >/dev/null; done; T3=$(date +%s%3N)
  BASE_MS=$((T1-T0)); REG_MS=$((T3-T2)); OVER=$(python - <<PY "$BASE_MS" "$REG_MS"
import sys
B=int(sys.argv[1]); R=int(sys.argv[2])
print((R-B)/B if B>0 else 0.0)
PY
)
  # snapshot after
  curl -fsS "$URL/metrics" > runs/metrics_after_${label}.txt || true
  jq -n --arg label "$label" --argjson agents $agents --argjson steps $steps --argjson baseline_ms $BASE_MS --argjson registry_ms $REG_MS --arg over "$OVER" '{label:$label,agents:$agents,steps:$steps,baseline_ms:$baseline_ms,registry_ms:$registry_ms,overhead_ratio:$over}' > runs/synth_${label}.json
}

mkdir -p runs
run_case 200 200 small
run_case 500 200 medium
run_case 1000 200 large

echo "Synthetic load done."

