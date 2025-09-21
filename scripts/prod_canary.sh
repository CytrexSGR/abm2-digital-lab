#!/usr/bin/env bash
set -euo pipefail

URL=${BACKEND_URL:-http://127.0.0.1:8000}
AGENTS=${CANARY_AGENTS:-50}
STEPS=${CANARY_STEPS:-20}

echo "Health..."
curl -fsS "$URL/api/registry/health" | jq '.'
PV=$(curl -fsS "$URL/api/registry/health" | jq -r '.pins_valid')
if [ "$PV" != "true" ]; then echo "Pins invalid"; exit 1; fi

echo "Metrics..."
curl -fsS "$URL/metrics" | grep -E 'registry_eval_ms_total|registry_batch_calls' >/dev/null

echo "Canary runs..."
# Save current pins
CURR=$(curl -fsS "$URL/api/pins" | jq -c '.pins')

# Baseline: clear pins
curl -fsS -X PUT "$URL/api/pins" -H 'Content-Type: application/json' -H 'X-User-Role: operator' -d '{"pins":{}}'
curl -fsS -X POST "$URL/api/simulation/reset" -H 'Content-Type: application/json' -d '{"num_agents":'"$AGENTS"',"network_connections":5}' >/dev/null
T0=$(date +%s%3N)
for i in $(seq 1 "$STEPS"); do curl -fsS -X POST "$URL/api/simulation/step" >/dev/null; done
T1=$(date +%s%3N)

# Registry run: restore pins
curl -fsS -X PUT "$URL/api/pins" -H 'Content-Type: application/json' -H 'X-User-Role: operator' -d '{"pins":'$CURR'}'
curl -fsS -X POST "$URL/api/simulation/reset" -H 'Content-Type: application/json' -d '{"num_agents":'"$AGENTS"',"network_connections":5}' >/dev/null
T2=$(date +%s%3N)
for i in $(seq 1 "$STEPS"); do curl -fsS -X POST "$URL/api/simulation/step" >/dev/null; done
T3=$(date +%s%3N)

BASE_MS=$((T1-T0))
REG_MS=$((T3-T2))
OVER=$(python - <<PY "$BASE_MS" "$REG_MS"
import sys
B=int(sys.argv[1]); R=int(sys.argv[2])
print((R-B)/B if B>0 else 0.0)
PY
$BASE_MS $REG_MS)

REPORT=runs/prod_canary_report.json
mkdir -p runs
curl -fsS "$URL/api/simulation/data" | jq '{final:.model_report.run_info.registry.telemetry}' > "$REPORT"
jq --argjson b $BASE_MS --argjson r $REG_MS --arg over "$OVER" '. + {baseline_ms:$b, registry_ms:$r, overhead_ratio:$over}' "$REPORT" > "$REPORT.tmp" && mv "$REPORT.tmp" "$REPORT"

echo "Overhead ratio: $OVER"
python - <<PY
import json,sys
rep=json.load(open('runs/prod_canary_report.json'))
over=rep.get('overhead_ratio',0.0)
assert over <= 0.10, f'Overhead too high: {over}'
tele=rep.get('final',{}).get('telemetry', rep.get('final',{}))
steps=int("$STEPS")
assert int(tele.get('batch_calls',0)) >= steps, 'batch_calls less than steps'
print('Canary PASS')
PY
