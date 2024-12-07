#!/bin/sh

if [ -z "${ROOT_PATH_PREFIX}" ]; then
  ROOT_PATH_PREFIX="/food-manager/api"
fi
. /app/venv/bin/activate
exec /app/venv/bin/uvicorn main:app --root-path "${ROOT_PATH_PREFIX}" --port ${API_INFO_PORT:-8001} --host 0.0.0.0 --reload