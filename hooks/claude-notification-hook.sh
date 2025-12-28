#!/bin/bash

# Claude Code Notification Hook
# This script is triggered when Claude Code agent sends a notification
# This is useful to detect when the agent is waiting for user input

# Read hook data from stdin
HOOK_DATA=$(cat)

# Get the script directory (where the hook scripts live)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Path to the hook handler
HOOK_HANDLER="$PROJECT_DIR/dist/presentation/handlers/claude-notification-handler.js"

# Check if the handler exists
if [ ! -f "$HOOK_HANDLER" ]; then
    echo "Warning: Hook handler not found at $HOOK_HANDLER" >&2
    exit 0
fi

# Set environment file path for the notification system
# This ensures we use the notification project's .env, not the current project's
export NOTIFICATION_ENV_PATH="$PROJECT_DIR/.env"

# Execute the hook handler with the hook data
echo "$HOOK_DATA" | node "$HOOK_HANDLER"

exit 0
