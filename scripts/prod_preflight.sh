#!/usr/bin/env bash
set -euo pipefail

PINS_FILE=${1:-digital-lab/backend/config/pins.json}
FORMULAS_DIR=${2:-digital-lab/backend/data/formulas}

if [ ! -f "$PINS_FILE" ]; then echo "Pins file not found: $PINS_FILE"; exit 2; fi
echo "Validating pins from $PINS_FILE against $FORMULAS_DIR"

pins=$(jq -r 'to_entries[] | "\(.key)@\(.value)"' "$PINS_FILE")
rc=0
for pv in $pins; do
  name=${pv%@*}; ver=${pv#*@}
  f="$FORMULAS_DIR/$name/$ver.json"
  if [ ! -f "$f" ]; then echo "ERROR: formula file missing: $f"; rc=1; continue; fi
  status=$(jq -r '.status' "$f")
  if [ "$status" != "released" ]; then echo "ERROR: $name@$ver is not released (status=$status)"; rc=1; fi
done
if [ "$rc" -ne 0 ]; then echo "Preflight FAILED"; exit 1; fi
echo "Preflight OK"

