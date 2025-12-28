#!/usr/bin/env node

/**
 * Claude Code Notification Hook Handler
 * This script is executed by the Claude Code hook when the agent sends a notification
 * It's particularly useful to detect when the agent is waiting for user input
 */

import { ConfigLoader } from '../config/ConfigLoader';
import { TelegramAdapter } from '../infrastructure/adapters/TelegramAdapter';
import { AgentEventService } from '../domain/services/AgentEventService';
import { AgentEventFactory } from '../domain/entities/AgentEvent';

/**
 * Extracts the last meaningful message from a JSONL transcript
 * The transcript contains JSON objects per line with conversation data
 */
function extractLastMeaningfulMessage(transcriptContent: string): string | undefined {
  try {
    // Split transcript into lines and filter out empty lines
    const lines = transcriptContent.split('\n').filter(line => line.trim());

    // Parse lines in reverse order to find the last meaningful message
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);

        // Skip entries that are just metadata or system messages
        if (!entry.type) continue;

        // Look for assistant messages with actual text content
        if (entry.type === 'assistant' && entry.text) {
          // Truncate if too long (max 300 chars)
          const text = entry.text.trim();
          return text.length > 300 ? text.substring(0, 300) + '...' : text;
        }

        // Look for tool results that might contain useful output
        if (entry.type === 'tool_result' && entry.content) {
          const content = typeof entry.content === 'string'
            ? entry.content
            : JSON.stringify(entry.content);
          const text = content.trim();
          return text.length > 300 ? text.substring(0, 300) + '...' : text;
        }
      } catch (parseError) {
        // Skip malformed JSON lines
        continue;
      }
    }

    return undefined;
  } catch (error) {
    console.error('[Hook] Error parsing transcript:', error);
    return undefined;
  }
}

async function main() {
  try {
    // Read hook data from stdin
    const hookData = await readStdin();

    console.log('[Hook] Received notification event from Claude Code');

    // Load configuration
    const config = ConfigLoader.load();

    // Create Telegram adapter
    const telegram = new TelegramAdapter(config.telegram);

    // Create event service
    const eventService = new AgentEventService(telegram, config.agentFilters);

    // Parse hook data
    const data = hookData ? JSON.parse(hookData) : {};

    console.log('[Hook] Notification Type:', data.notification_type);
    console.log('[Hook] Message:', data.message);
    console.log('[Hook] Session ID:', data.session_id);

    // Only send notification for specific types
    // idle_prompt: Agent is waiting for user input
    // permission_prompt: Agent is waiting for permission
    const notificationTypes = ['idle_prompt', 'permission_prompt'];
    
    if (!notificationTypes.includes(data.notification_type)) {
      console.log('[Hook] Notification type not configured for alerts, skipping');
      process.exit(0);
    }

    // Try to read transcript for context
    let lastOutput: string | undefined;
    if (data.transcript_path) {
      try {
        const fs = require('fs');
        const transcriptContent = fs.readFileSync(data.transcript_path, 'utf-8');
        lastOutput = extractLastMeaningfulMessage(transcriptContent);
      } catch (error) {
        console.error('[Hook] Could not read transcript:', error);
      }
    }

    // Create and process notification event
    const event = AgentEventFactory.createNotificationEvent(
      'Claude Code',
      data.message || 'Agent notification',
      data.notification_type,
      data.title,
      data.cwd,
      lastOutput
    );

    await eventService.processEvent(event);

    console.log('[Hook] Notification sent successfully');

    // Exit with code 0 to allow Claude to continue normally
    process.exit(0);
  } catch (error) {
    console.error('[Hook] Error processing notification event:', error);
    // Exit with 0 even on error to not block Claude
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
