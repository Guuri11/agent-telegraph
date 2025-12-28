import * as dotenv from 'dotenv';
import { EventFilter } from '../domain/services/AgentEventService';

// Load .env from custom path if specified (used by hooks from other projects)
// Otherwise load from default location (.env in current directory)
const envPath = process.env.NOTIFICATION_ENV_PATH;
dotenv.config({ path: envPath });

export interface Config {
  telegram: {
    botToken: string;
    chatId: string;
  };
  agentFilters?: EventFilter;
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

  private static loadAgentFilters(): EventFilter {
    const filter: EventFilter = {};

    const filterAgents = process.env.FILTER_AGENT_NAMES;
    if (filterAgents !== undefined) {
      filter.agentNames = filterAgents.trim() === ''
        ? []
        : filterAgents.split(',').map(name => name.trim()).filter(name => name !== '');
    }

    const filterEventTypes = process.env.FILTER_EVENT_TYPES;
    if (filterEventTypes !== undefined) {
      filter.eventTypes = filterEventTypes.trim() === ''
        ? []
        : filterEventTypes.split(',').map(type => type.trim() as any).filter(type => type !== '');
    }

    return filter;
  }
}
