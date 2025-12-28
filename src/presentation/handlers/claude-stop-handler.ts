#!/usr/bin/env node

/**
 * Claude Code Stop Hook Handler
 * This script is executed by the Claude Code hook when an agent stops
 */

import { ConfigLoader } from '../../infrastructure/config/ConfigLoader';
import { TelegramAdapter } from '../../infrastructure/adapters/TelegramAdapter';
import { ProcessAgentEventUseCase } from '../../application/use-cases/ProcessAgentEventUseCase';
import { EventFilterService } from '../../application/services/EventFilterService';
import { TelegramMessageFormatter } from '../formatters/TelegramMessageFormatter';
import { AgentEvent } from '../../domain/entities/AgentEvent';
import { AgentName } from '../../domain/value-objects/AgentName';
import { EventMetadata } from '../../domain/value-objects/EventMetadata';

async function main() {
  try {
    // Read hook data from stdin
    const hookData = await readStdin();

    console.log('[Hook] Received stop event from Claude Code');

    // Load configuration
    const config = ConfigLoader.load();

    // Create dependencies (Clean Architecture layers)
    const telegramAdapter = new TelegramAdapter(config.telegram);
    const formatter = new TelegramMessageFormatter();
    const processEventUseCase = new ProcessAgentEventUseCase(telegramAdapter, formatter);
    const filterService = new EventFilterService(config.agentFilters);

    // Parse hook data
    const data = hookData ? JSON.parse(hookData) : {};

    console.log('[Hook] Session ID:', data.session_id);
    console.log('[Hook] Hook Event:', data.hook_event_name);

    // Check if we're already continuing from a previous stop hook (prevent infinite loops)
    if (data.stop_hook_active === true) {
      console.log('[Hook] Stop hook already active, skipping notification');
      process.exit(0);
    }

    // Create event using domain entities and value objects
    const event = AgentEvent.agentStopped(
      AgentName.create('Claude Code'),
      EventMetadata.create({
        taskDescription: 'Session completed'
      })
    );

    // Apply filters
    if (!filterService.shouldProcess(event)) {
      console.log('[Hook] Event filtered out, not sending notification');
      process.exit(0);
    }

    // Process event through use case
    await processEventUseCase.execute(event);

    console.log('[Hook] Notification sent successfully');

    // Exit with code 0 to allow Claude to stop normally
    process.exit(0);
  } catch (error) {
    console.error('[Hook] Error processing stop event:', error);
    // Exit with 0 even on error to not block Claude from stopping
    process.exit(0);
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data.trim());
    });

    // If stdin is empty, resolve immediately
    setTimeout(() => {
      if (data === '') {
        resolve('');
      }
    }, 100);
  });
}

// Run the handler
if (require.main === module) {
  main();
}
