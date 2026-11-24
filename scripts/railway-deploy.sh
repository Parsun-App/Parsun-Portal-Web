#!/bin/sh
set -eu

: "${RAILWAY_SERVICE:?RAILWAY_SERVICE is required}"

rm -rf dist/ target/ .git/ node_modules/ 2>/dev/null || true
echo "Deploying ${RAILWAY_SERVICE} (context: $(du -sh . | cut -f1))"

if [ -n "${RAILWAY_TOKEN:-}" ]; then
  railway up --service "$RAILWAY_SERVICE" --ci
else
  : "${RAILWAY_PROJECT_ID:?RAILWAY_PROJECT_ID is required when RAILWAY_TOKEN is not set}"
  railway up --service "$RAILWAY_SERVICE" --project "$RAILWAY_PROJECT_ID" --environment production --ci
fi
