# Claude Code Hooks Integration

This document explains how to configure Claude Code to send notifications when it finishes tasks.

## Architecture

The project uses **Hexagonal Architecture** (Ports and Adapters) to support different AI agents:

```
src/
├── domain/
│   ├── entities/
│   │   └── AgentEvent.ts         # Domain entity for agent events
│   ├── ports/
│   │   └── AgentMonitor.ts       # Port for monitoring agents
│   └── services/
│       └── AgentEventService.ts  # Service for processing agent events
└── infrastructure/
    └── adapters/
        ├── TelegramAdapter.ts         # Telegram notification adapter
        └── ClaudeCodeHookAdapter.ts   # Claude Code hook adapter
```

## Setup

### 1. Build the project

```bash
npm run build:hooks
```

This compiles TypeScript and makes hook scripts executable.

### 2. Configure Claude Code hooks

Claude Code uses hooks to execute custom scripts on specific events. You can configure multiple hooks:

- **Stop**: Triggered when the agent finishes execution
- **Notification**: Triggered when the agent sends status updates (e.g., waiting for input)

#### Configure in settings file

Edit your Claude Code settings file. You can use either:
- **Project settings**: `.claude/settings.local.json` (recommended, not committed to git)
- **User settings**: `~/.claude/settings.json` (applies to all projects)

Add the following configuration:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/hooks/claude-stop-hook.sh"
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/hooks/claude-notification-hook.sh"
          }
        ]
      }
    ]
  }
}
```

**Important notes:**
- The hook events are `"Stop"` and `"Notification"` (capital letters)
- Use `$CLAUDE_PROJECT_DIR` to reference the project root
- The hooks receive JSON data via stdin with session information
- The Notification hook is especially useful to know when Claude is waiting for your input

### 3. Configure environment variables

Make sure your `.env` file has the required Telegram configuration:

```env
# Required
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Optional: Filter which agent events to notify
ENABLE_AGENT_FILTERS=false
FILTER_AGENT_NAMES=Claude Code,GPT-4
FILTER_EVENT_TYPES=agent_stopped,task_completed
```

## Testing

### Test the hook manually

```bash
npm run hook:test
```

This simulates Claude Code calling the stop hook and should send a notification to Telegram.

### Test with real Claude Code

1. Run a Claude Code agent with both hooks configured
2. When it finishes a task, the **Stop** hook triggers and sends a notification
3. When it's waiting for your input, the **Notification** hook triggers
4. You should receive Telegram notifications with:
   - For Stop hook: Agent name, task description, duration, timestamp
   - For Notification hook: Project path, status message, last output from transcript

## Event Types

The system supports the following agent events:

- `agent_started` 🚀 - Agent begins execution
- `agent_stopped` ✅ - Agent finishes execution
- `waiting_for_input` ⏸️ - Agent is waiting for user input (from Notification hook)
- `task_completed` 🎯 - Specific task completed
- `tool_used` 🔧 - Agent uses a tool
- `error_occurred` ❌ - Error during execution

## Hook Types

### Stop Hook

The Stop hook is triggered when Claude Code finishes execution. This sends a notification with:
- Agent name (Claude Code)
- Task description (if available)
- Duration
- Timestamp

### Notification Hook

The Notification hook is triggered when Claude Code sends status updates. It's particularly useful for detecting when the agent is waiting for your input.

The notification includes:
- **Project path**: Current working directory
- **Message**: Status message from Claude
- **Last output**: Last 1000 characters from the transcript (to give you context)
- **Notification type**: Can be `idle_prompt`, `permission_prompt`, `auth_success`, or `elicitation_dialog`

This hook only sends Telegram notifications for `idle_prompt` and `permission_prompt` types, which indicate Claude is waiting for user action.

## Filtering Events

You can filter which events trigger notifications:

```env
ENABLE_AGENT_FILTERS=true

# Only notify for these agents (comma-separated)
FILTER_AGENT_NAMES=Claude Code

# Only notify for these event types (comma-separated)
FILTER_EVENT_TYPES=agent_stopped,waiting_for_input,error_occurred
```

**Note**: The `waiting_for_input` event type is particularly useful to get notified when Claude is idle and waiting for your response.

## Adding Support for Other AI Agents

To add support for other AI agents (e.g., OpenAI Code, Cursor):

1. Create a new adapter implementing `AgentMonitor` interface
2. Create hook scripts for that agent
3. Configure the agent to call your hooks
4. The rest of the architecture remains the same!

Example for a new agent:

```typescript
// src/infrastructure/adapters/OpenAICodeHookAdapter.ts
export class OpenAICodeHookAdapter implements AgentMonitor {
  // Implementation here
}
```

## Troubleshooting

### Hook not executing

- Check hook script has execute permissions: `chmod +x hooks/claude-stop-hook.sh`
- Verify the absolute path in Claude Code settings
- Check Claude Code documentation for hook configuration

### Notification not sent

- Run `npm run hook:test` to test the handler directly
- Check `.env` file has correct Telegram credentials
- Check logs in the hook handler output

### TypeScript errors

- Run `npm run build` to compile TypeScript
- Check `dist/hooks/claude-stop-handler.js` exists after build

## References

- [Claude Code Hooks Documentation](https://platform.claude.com/docs/en/agent-sdk/hooks)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
