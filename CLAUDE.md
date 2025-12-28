# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agent Telegraph** is a TypeScript application that forwards AI agent events to Telegram in real-time. It integrates with Claude Code via hooks.

## Development Commands

### Build & Run
```bash
npm run build              # Compile TypeScript to JavaScript
npm run build:hooks        # Compile and make hook scripts executable
npm start                  # Run compiled application (keeps service alive for hooks)
npm run dev                # Run in development mode with ts-node
```

### Testing
```bash
npm test                   # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run hook:test          # Test Claude Code hook manually
```

### Running Single Tests
Use Jest's pattern matching to run specific tests:
```bash
npx jest AgentEventService.test.ts             # Run specific test file
npx jest -t "should process event"             # Run tests matching name
npx jest src/domain/services                   # Run tests in directory
```

## Architecture

The project follows **Hexagonal Architecture** (Ports & Adapters) with strict layer separation:

### Layer Structure

**Domain Layer** (`src/domain/`):
- Pure business logic with no external dependencies
- `entities/`: Core domain objects (AgentEvent)
- `ports/`: Interfaces defining contracts (AgentMonitor)
- `services/`: Business logic services (AgentEventService)

**Infrastructure Layer** (`src/infrastructure/`):
- External integrations and implementations
- `adapters/`: Implementations of domain ports
  - `TelegramAdapter`: Telegram bot integration
  - `ClaudeCodeHookAdapter`: Claude Code hook integration

**Application Layer**:
- `index.ts`: Main entry point that keeps service alive for agent hooks
- `config/ConfigLoader.ts`: Environment configuration management
- `hooks/`: Hook handlers for AI agent integration
  - `claude-stop-handler.ts`: Handles Claude Code stop events
  - `claude-notification-handler.ts`: Handles Claude Code notifications

### Key Design Patterns

**Dependency Inversion**: Domain services depend on interfaces (ports), not concrete implementations. For example, `AgentEventService` accepts any `EventNotifier`, not specifically `TelegramAdapter`.

**Filtering Architecture**: Agent event filtering is optional and configured via environment variables:
- Filters are optional (ENABLE_AGENT_FILTERS=true)
- Services check filters before processing
- Multiple filter criteria are combined with AND logic

**Agent Event System**: The agent event system uses an enum-based event type system with factory methods for creating common events. This makes adding support for new AI agents straightforward without modifying domain logic.

**Hook-based Integration**: The service stays alive to enable hooks from AI agents (Claude Code) to send events via Telegram. Hooks are executed independently and communicate via the shared Telegram adapter.

## Configuration

Configuration is loaded from `.env` file (use `.env.example` as template):

**Required**:
- `TELEGRAM_BOT_TOKEN`: Telegram bot API token
- `TELEGRAM_CHAT_ID`: Target chat ID for notifications

**Optional Agent Event Filters**:
- `ENABLE_AGENT_FILTERS=true`: Enable agent event filtering
- `FILTER_AGENT_NAMES`: Comma-separated agent names (e.g., "Claude Code")
- `FILTER_EVENT_TYPES`: Comma-separated event types (agent_stopped, task_completed, etc.)

## Claude Code Integration

This project includes hooks for Claude Code integration. When Claude Code completes a task, it can trigger a notification to Telegram.

### Setup Hook
1. Build hooks: `npm run build:hooks`
2. Add to `.claude/settings.local.json`:
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
    ]
  }
}
```

### Hook Implementation
- Hook handler: `src/hooks/claude-stop-handler.ts`
- Shell wrapper: `hooks/claude-stop-hook.sh`
- Receives JSON via stdin with task information
- Creates AgentEvent and sends via TelegramAdapter

See `CLAUDE_HOOKS.md` for detailed hook integration documentation.

## Adding Support for New AI Agents

To add support for new AI agents, use a hook-based approach:

1. Create adapter in `src/infrastructure/adapters/` implementing `AgentMonitor` interface
2. Create hook scripts in `hooks/` directory
3. Configure agent to call hooks
4. Add configuration in `ConfigLoader` if needed

The hook-based approach is simple and works with any agent that can call shell scripts. The domain layer (entities, services) requires no changes due to the port-adapter pattern.

## Test Strategy

The project uses Test-Driven Development (TDD):

- All domain logic has comprehensive unit tests
- Tests are located in `__tests__` directories alongside source files
- Jest configuration excludes test files from compilation
- Test environment: Node.js
- Coverage is tracked and reported in `coverage/` directory

When modifying code:
1. Run relevant tests first to understand current behavior
2. Update tests to reflect new requirements
3. Implement changes to make tests pass
4. Verify full test suite passes before committing
