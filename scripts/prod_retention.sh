#!/usr/bin/env bash
set -euo pipefail

AUDIT_DIR=${1:-digital-lab/backend/data}
AUDIT_FILE="$AUDIT_DIR/audit.jsonl"
NOW=$(date -u +%Y-%m)

mkdir -p "$AUDIT_DIR/archive"

if [ -f "$AUDIT_FILE" ]; then
  ARCHIVE="$AUDIT_DIR/archive/audit-$NOW.jsonl.gz"
  cp "$AUDIT_FILE" "/tmp/audit-$NOW.jsonl"
  gzip -c "/tmp/audit-$NOW.jsonl" > "$ARCHIVE"
  : > "$AUDIT_FILE"
  echo "Rotated audit to $ARCHIVE"
fi

# Keep last 12 months
ls -1t "$AUDIT_DIR/archive"/audit-*.jsonl.gz | awk 'NR>12' | xargs -r rm -f

