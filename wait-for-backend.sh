#!/bin/sh
# wait-for-backend.sh — waits for parsun-api to be ready before starting the dev server

set -e

BACKEND_HOST="${BACKEND_HOST:-parsun-api-app}"
BACKEND_PORT="${BACKEND_PORT:-8080}"
TIMEOUT="${TIMEOUT:-120}"

echo "Waiting for backend at $BACKEND_HOST:$BACKEND_PORT..."

for i in $(seq 1 $TIMEOUT); do
  if wget --no-verbose --tries=1 --spider "http://$BACKEND_HOST:$BACKEND_PORT" 2>/dev/null; then
    echo "Backend is ready!"
    exec "$@"
  fi
  sleep 2
done

echo "Timeout reached — backend did not respond within ${TIMEOUT}s"
exit 1
