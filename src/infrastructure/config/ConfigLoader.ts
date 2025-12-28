import * as dotenv from 'dotenv';
import { EventFilterCriteria } from '../../application/services/EventFilterService';
import { EventType } from '../../domain/value-objects/EventType';

// Load .env from custom path if specified (used by hooks from other projects)
// Otherwise load from default location (.env in current directory)
const envPath = process.env.NOTIFICATION_ENV_PATH;
dotenv.config({ path: envPath });

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface Config {
  telegram: TelegramConfig;
  agentFilters?: EventFilterCriteria;
}

export class ConfigLoader {
  static load(): Config {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
    }

    if (!chatId) {
      throw new Error('TELEGRAM_CHAT_ID is not set in environment variables');
    }

    const config: Config = {
      telegram: {
        botToken,
        chatId
      }
    };

    // Load agent event filters if enabled
    const enableAgentFilters = process.env.ENABLE_AGENT_FILTERS === 'true';
    if (enableAgentFilters) {
      config.agentFilters = this.loadAgentFilters();
    }

    return config;
  }

  private static loadAgentFilters(): EventFilterCriteria {
    const filter: EventFilterCriteria = {};

    const filterAgents = process.env.FILTER_AGENT_NAMES;
    if (filterAgents !== undefined) {
      filter.agentNames = filterAgents.trim() === ''
        ? []
        : filterAgents.split(',').map(name => name.trim()).filter(name => name !== '');
    }

    const filterEventTypesStr = process.env.FILTER_EVENT_TYPES;
    if (filterEventTypesStr !== undefined) {
      const typeStrings = filterEventTypesStr.trim() === ''
        ? []
        : filterEventTypesStr.split(',').map(type => type.trim()).filter(type => type !== '');

      // Convert string types to EventType value objects
      filter.eventTypes = typeStrings
        .map(typeStr => {
          try {
            return EventType.fromString(typeStr);
          } catch {
            console.warn(`Invalid event type in config: ${typeStr}`);
            return null;
          }
        })
        .filter((type): type is EventType => type !== null);
    }

    return filter;
  }
}
