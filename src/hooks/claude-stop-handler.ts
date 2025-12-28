#!/usr/bin/env node

/**
 * Claude Code Stop Hook Handler
 * This script is executed by the Claude Code hook when an agent stops
 */

import { ConfigLoader } from '../config/ConfigLoader';
import { TelegramAdapter } from '../infrastructure/adapters/TelegramAdapter';
import { AgentEventService } from '../domain/services/AgentEventService';
import { AgentEventFactory } from '../domain/entities/AgentEvent';

async function main() {
  try {
    // Read hook data from stdin
    const hookData = await readStdin();

    console.log('[Hook] Received stop event from Claude Code');

    // Load configuration
    const config = ConfigLoader.load();

    // Create Telegram adapter
    const telegram = new TelegramAdapter(config.telegram);

    // Create event service
    const eventService = new AgentEventService(telegram, config.agentFilters);

    // Parse hook data
    const data = hookData ? JSON.parse(hookData) : {};

    console.log('[Hook] Session ID:', data.session_id);
    console.log('[Hook] Hook Event:', data.hook_event_name);

    // Check if we're already continuing from a previous stop hook (prevent infinite loops)
    if (data.stop_hook_active === true) {
      console.log('[Hook] Stop hook already active, skipping notification');
      process.exit(0);
    }

    // Create and process stop event
    const event = AgentEventFactory.createStopEvent(
      'Claude Code',
      'Session completed',
      undefined
    );

    await eventService.processEvent(event);

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
