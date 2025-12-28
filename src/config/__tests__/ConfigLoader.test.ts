import { ConfigLoader } from '../ConfigLoader';

describe('ConfigLoader', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('load', () => {
    it('should load basic configuration successfully', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.TELEGRAM_CHAT_ID = '123456';

      const config = ConfigLoader.load();

      expect(config.telegram.botToken).toBe('test-token');
      expect(config.telegram.chatId).toBe('123456');
      expect(config.agentFilters).toBeUndefined();
    });

    it('should throw error when bot token is missing', () => {
      process.env.TELEGRAM_CHAT_ID = '123456';
      delete process.env.TELEGRAM_BOT_TOKEN;

      expect(() => ConfigLoader.load()).toThrow('TELEGRAM_BOT_TOKEN is not set');
    });

    it('should throw error when chat ID is missing', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      delete process.env.TELEGRAM_CHAT_ID;

      expect(() => ConfigLoader.load()).toThrow('TELEGRAM_CHAT_ID is not set');
    });

    it('should load agent filters when enabled', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.TELEGRAM_CHAT_ID = '123456';
      process.env.ENABLE_AGENT_FILTERS = 'true';
      process.env.FILTER_AGENT_NAMES = 'Claude Code';
      process.env.FILTER_EVENT_TYPES = 'agent_stopped,waiting_for_input';

      const config = ConfigLoader.load();

      expect(config.agentFilters).toBeDefined();
      expect(config.agentFilters?.agentNames).toEqual(['Claude Code']);
      expect(config.agentFilters?.eventTypes).toEqual(['agent_stopped', 'waiting_for_input']);
    });

    it('should not load agent filters when disabled', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.TELEGRAM_CHAT_ID = '123456';
      process.env.ENABLE_AGENT_FILTERS = 'false';
      process.env.FILTER_AGENT_NAMES = 'Claude Code';

      const config = ConfigLoader.load();

      expect(config.agentFilters).toBeUndefined();
    });

    it('should handle empty agent filter values', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.TELEGRAM_CHAT_ID = '123456';
      process.env.ENABLE_AGENT_FILTERS = 'true';
      process.env.FILTER_AGENT_NAMES = '';
      process.env.FILTER_EVENT_TYPES = '';

      const config = ConfigLoader.load();

      expect(config.agentFilters).toBeDefined();
      expect(config.agentFilters?.agentNames).toEqual([]);
      expect(config.agentFilters?.eventTypes).toEqual([]);
    });

    it('should trim whitespace from agent filter values', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.TELEGRAM_CHAT_ID = '123456';
      process.env.ENABLE_AGENT_FILTERS = 'true';
      process.env.FILTER_AGENT_NAMES = ' Claude Code , Agent Two ';
      process.env.FILTER_EVENT_TYPES = ' agent_stopped , waiting_for_input ';

      const config = ConfigLoader.load();

      expect(config.agentFilters?.agentNames).toEqual(['Claude Code', 'Agent Two']);
      expect(config.agentFilters?.eventTypes).toEqual(['agent_stopped', 'waiting_for_input']);
    });
  });
});
