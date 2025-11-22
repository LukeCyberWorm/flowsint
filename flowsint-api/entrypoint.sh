#!/usr/bin/env bash
set -e

if [ "$SKIP_MIGRATIONS" != "true" ]; then
  echo "Running database migrations..."
  alembic upgrade head
else
  echo "Skipping database migrations (SKIP_MIGRATIONS=true)..."
fi

echo "Starting application..."
exec uvicorn flowsint_api.main:app --host 0.0.0.0 --port 5001 --reload