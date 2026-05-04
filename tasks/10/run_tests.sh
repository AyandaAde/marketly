#!/bin/bash
# run_tests.sh - Test execution script for Task 10
# Usage: ./run_tests.sh
# 
# This script will run tests for task 10
#
# It will:
# 1. Look for .tsx test files and run them with Jest

set -euo pipefail

TASK_ID=${10:-${TASK_ID:-10}}

if [ -z "$TASK_ID" ]; then
  echo "Usage: bash run-tests.sh [task-id]"
  echo "Example: bash run-tests.sh 10"
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