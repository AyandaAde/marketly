#!/bin/bash
# run_tests.sh - Test execution script for IDE Arena
# Usage: ./run_tests.sh <task_id>
# Example: ./run_tests.sh 1

# For the task, it will:
# 1. Look for task-specific run_tests.sh script

set -euo pipefail

TASK_ID="$1"

if [ -z "$TASK_ID" ]; then
    echo "Error: Task ID is required"
    echo "Usage: ./run_tests.sh <task_id>"
    echo "Example: ./run_tests.sh 5  (runs tests for task 5)"
    exit 1
fi

# Validate task ID is a number between 1 and 10
if ! [[ "$TASK_ID" =~ ^[0-9]+$ ]] || [ "$TASK_ID" -lt 1 ] || [ "$TASK_ID" -gt 10 ]; then
    echo "Error: Invalid task ID '$TASK_ID'. Task ID must be a number between 1 and 10."
    echo "Usage: ./run_tests.sh <task_id>"
    exit 1
fi

echo "Task ${TASK_ID} Running tests..."

# --- Build the project ---

if [ ! -d "node_modules" ]; then 
  echo "Installing dependencies..."
  npm install --silent
fi

export NODE_ENV=test

TEST_FILE="tasks/${TASK_ID}/task_tests.tsx"

echo "Running tests from: $TEST_FILE"

npx jest "$TEST_FILE" \
  --testMatch="**/task_tests.tsx" \
  --runInBand \
  --no-coverage \
  --verbose
