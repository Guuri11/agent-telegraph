#!/bin/bash

# Script to help setup Claude Code hook
# This script provides the command to configure Claude Code hooks

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK_SCRIPT="$PROJECT_DIR/hooks/claude-stop-hook.sh"

echo "======================================"
echo "Claude Code Hook Setup"
echo "======================================"
echo ""
echo "1. Make sure you have built the project:"
echo "   npm run build:hooks"
echo ""
echo "2. Add this hook to your Claude Code configuration:"
echo ""
echo "   Hook path: $HOOK_SCRIPT"
echo ""
echo "3. Configure Claude Code hooks:"
echo ""
echo "   Edit .claude/settings.local.json (or ~/.claude/settings.json) and add:"
echo ""
echo '   {'
echo '     "hooks": {'
echo '       "Stop": ['
echo '         {'
echo '           "hooks": ['
echo '             {'
echo '               "type": "command",'
echo '               "command": "$CLAUDE_PROJECT_DIR/hooks/claude-stop-hook.sh"'
echo '             }'
echo '           ]'
echo '         }'
echo '       ]'
echo '     }'
echo '   }'
echo ""
echo "4. Test the hook:"
echo "   npm run hook:test"
echo ""
echo "======================================"
echo ""

# Check if hook script exists and is executable
if [ -f "$HOOK_SCRIPT" ]; then
    if [ -x "$HOOK_SCRIPT" ]; then
        echo "✓ Hook script exists and is executable"
    else
        echo "⚠ Hook script exists but is not executable"
        echo "  Run: chmod +x $HOOK_SCRIPT"
    fi
else
    echo "✗ Hook script not found at $HOOK_SCRIPT"
    echo "  Make sure you are in the project directory"
fi

# Check if handler exists
HANDLER_SCRIPT="$PROJECT_DIR/dist/hooks/claude-stop-handler.js"
if [ -f "$HANDLER_SCRIPT" ]; then
    echo "✓ Handler script compiled"
else
    echo "✗ Handler script not compiled"
    echo "  Run: npm run build"
fi

echo ""
