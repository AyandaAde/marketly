#!/usr/bin/env bash
set -euo pipefail

TASK_ID=${4:-${TASK_ID:-4}}

if [ -z "$TASK_ID" ]; then
  echo "Usage: bash run-tests.sh [task-id]"
  echo "Example: bash run-tests.sh 4"
  exit 1
fi

echo "Task ${TASK_ID} Running tests..."

# --- Build the project ---

if [ ! -d "node_modules" ]; then 
  echo "Installing dependencies..."
  npm install --silent
fi

# Export needed env vars
export NODE_ENV=test

# Disable watchman to avoid WSL issues on Windows
export CI=true

# Run the tests for the specific task ID
TEST_FILE="tasks/${TASK_ID}/task_tests.tsx"

echo "Running tests from: $TEST_FILE"

# Override testMatch to include task_tests.tsx files
# Jest's default pattern doesn't match task_tests.tsx (it expects *.test.tsx or *.spec.tsx)
npx jest "$TEST_FILE" \
  --testMatch="**/task_tests.tsx" \
  --runInBand \
  --no-coverage