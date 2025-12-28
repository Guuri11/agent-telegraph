# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agent Telegraph** is a TypeScript application that forwards AI agent events to Telegram in real-time. It integrates with Claude Code via hooks.

## Architecture

The project follows **Clean Architecture** with **Domain-Driven Design (DDD)** principles and strict **Test-Driven Development (TDD)**.

### Core Principles

1. **Clean Architecture**: Dependencies flow inward toward the domain
2. **DDD**: Value Objects, Entities, Ubiquitous Language
3. **Immutability**: All domain objects are immutable and frozen
4. **TDD**: Tests are written first, then implementation (Red-Green-Refactor)
5. **No Invalid States**: Validation in constructors prevents invalid objects

### Layer Structure

**Domain Layer** (`src/domain/`):
- **Pure business logic** with ZERO external dependencies
- `entities/`: Immutable entities with invariantes (AgentEvent)
- `value-objects/`: Immutable value objects (AgentName, EventType, EventTimestamp, EventMetadata)
- `ports/`: Interfaces for external dependencies (EventNotifier)

**Application Layer** (`src/application/`):
- **Use Cases** that orchestrate business logic
- `use-cases/`: Application-specific business rules (ProcessAgentEventUseCase)
- `services/`: Application services (EventFilterService)

**Infrastructure Layer** (`src/infrastructure/`):
- **External integrations** and technical details
- `adapters/`: Implementations of domain ports (TelegramAdapter)
- `config/`: Configuration management (ConfigLoader)

**Presentation Layer** (`src/presentation/`):
- **UI and formatting** concerns
- `formatters/`: Message formatting (TelegramMessageFormatter)
- `handlers/`: Hook handlers for AI agents (claude-stop-handler, claude-notification-handler)

### Development Commands

```bash
npm run build              # Compile TypeScript
npm run build:hooks        # Compile and make hooks executable
npm start                  # Run compiled application
npm run dev                # Run in development mode

npm test                   # Run all tests (144 tests)
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report

npx jest <file>            # Run specific test file
npx jest -t "pattern"      # Run tests matching pattern
```

## Development Workflow (TDD)

When adding new features or fixing bugs, ALWAYS follow TDD:

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make it pass
3. **Refactor**: Improve code while keeping tests green

### Example: Adding a New Value Object

```bash
# 1. Write test first (RED)
npx jest NewValueObject.test.ts  # Should fail

# 2. Implement minimum code (GREEN)
# ... implement NewValueObject ...
npx jest NewValueObject.test.ts  # Should pass

# 3. Refactor if needed
```

## Code Modification Rules

### CRITICAL: Domain Layer Purity

- **NEVER** import infrastructure or presentation in domain
- **NEVER** use concrete implementations in domain (use ports/interfaces)
- **NEVER** make domain objects mutable
- **ALWAYS** validate in constructors (fail-fast)
- **ALWAYS** use Value Objects instead of primitives

### Adding New Features

1. **Start with Domain**: Create/modify Value Objects and Entities
2. **Add Use Case**: Create use case in application layer
3. **Implement Adapter**: Add infrastructure implementation if needed
4. **Add Presenter**: Add formatting in presentation layer
5. **Wire Everything**: Update dependency injection in handlers/index.ts

### Testing Strategy

- **Domain**: 100% unit test coverage (no mocks needed)
- **Application**: Unit tests with mocked dependencies
- **Infrastructure**: Integration tests with real services (mocked external APIs)
- **Presentation**: Unit tests for formatters

## Claude Code Integration

### Hook Locations

Hooks are in `src/presentation/handlers/`:
- `claude-stop-handler.ts`: Triggered when Claude stops
- `claude-notification-handler.ts`: Triggered on notifications (waiting for input)

### Hook Configuration

Add to `.claude/settings.local.json`:

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

## Adding Support for New AI Agents

To add a new AI agent (e.g., GPT-4, Gemini):

1. **No domain changes needed!** AgentEvent already supports any agent
2. Create handler in `src/presentation/handlers/`
3. Create shell script wrapper in `hooks/`
4. Use existing Use Cases and Value Objects

Example handler structure:

```typescript
import { AgentEvent } from '../../domain/entities/AgentEvent';
import { AgentName } from '../../domain/value-objects/AgentName';
import { EventMetadata } from '../../domain/value-objects/EventMetadata';
import { ProcessAgentEventUseCase } from '../../application/use-cases/ProcessAgentEventUseCase';
// ... other imports

async function main() {
  // 1. Load config
  const config = ConfigLoader.load();

  // 2. Create dependencies (Clean Architecture)
  const adapter = new TelegramAdapter(config.telegram);
  const formatter = new TelegramMessageFormatter();
  const useCase = new ProcessAgentEventUseCase(adapter, formatter);
  const filterService = new EventFilterService(config.agentFilters);

  // 3. Create event with Value Objects
  const event = AgentEvent.agentStopped(
    AgentName.create('New Agent Name'),
    EventMetadata.create({ taskDescription: 'Task done' })
  );

  // 4. Filter and process
  if (filterService.shouldProcess(event)) {
    await useCase.execute(event);
  }
}
```

## Common Patterns

### Creating AgentEvent

```typescript
// Using factory methods (recommended)
const event = AgentEvent.agentStopped(
  AgentName.create('Claude Code'),
  EventMetadata.create({
    taskDescription: 'Feature implemented',
    duration: 5000
  })
);

// Using create (for custom timestamps)
const event = AgentEvent.create({
  agentName: AgentName.create('Claude Code'),
  eventType: EventType.agentStopped(),
  timestamp: EventTimestamp.fromDate(customDate),
  metadata: EventMetadata.create({})
});
```

### Value Object Validation

All Value Objects validate on creation:

```typescript
// Throws error if invalid
const name = AgentName.create(''); // Error: name cannot be empty
const type = EventType.fromString('invalid'); // Error: invalid type
const timestamp = EventTimestamp.fromDate(futureDate); // Error: cannot be in future
```

### Immutability

```typescript
const event = AgentEvent.agentStarted(/* ... */);

// This throws error (object is frozen)
event.agentName = AgentName.create('Modified'); // Error!

// Value Objects are also immutable
const metadata = EventMetadata.create({ taskDescription: 'Task' });
metadata.taskDescription = 'Modified'; // Error!
```

## Configuration

`.env` file (use `.env.example` as template):

**Required**:
- `TELEGRAM_BOT_TOKEN`: Telegram bot API token
- `TELEGRAM_CHAT_ID`: Target chat ID

**Optional Filters**:
- `ENABLE_AGENT_FILTERS=true`: Enable filtering
- `FILTER_AGENT_NAMES`: Comma-separated agent names
- `FILTER_EVENT_TYPES`: Comma-separated event types (agent_stopped, waiting_for_input, etc.)

## When Modifying Code

1. **Read tests first** to understand current behavior
2. **Write test** for new behavior (TDD Red)
3. **Implement** minimum code to pass (TDD Green)
4. **Refactor** while keeping tests green
5. **Run full suite**: `npm test`
6. **Verify**: All 144+ tests should pass

## Important Files

- `src/domain/entities/AgentEvent.ts`: Core entity
- `src/domain/value-objects/*.ts`: Value Objects (immutable)
- `src/application/use-cases/ProcessAgentEventUseCase.ts`: Main use case
- `src/presentation/formatters/TelegramMessageFormatter.ts`: Message formatting
- `src/infrastructure/config/ConfigLoader.ts`: Configuration

## Anti-Patterns to Avoid

❌ **Don't**: Import infrastructure in domain
❌ **Don't**: Use primitives in domain (use Value Objects)
❌ **Don't**: Make domain objects mutable
❌ **Don't**: Skip tests (always TDD)
❌ **Don't**: Put business logic in presentation/infrastructure

✅ **Do**: Keep domain pure
✅ **Do**: Use Value Objects everywhere
✅ **Do**: Make everything immutable
✅ **Do**: Write tests first (TDD)
✅ **Do**: Follow Clean Architecture layers
