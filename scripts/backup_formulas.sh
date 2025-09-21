#!/usr/bin/env bash
set -euo pipefail

OUTDIR=${1:-runs}
DATE=$(date -u +%Y%m%d-%H%M%S)
COMMIT=${GITHUB_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo local)}
ARCHIVE="$OUTDIR/backup-$DATE-$COMMIT.zip"
mkdir -p "$OUTDIR"

zip -r "$ARCHIVE" digital-lab/backend/data/formulas digital-lab/backend/config/pins.json digital-lab/backend/data/audit.jsonl* >/dev/null || true
echo "$ARCHIVE"

