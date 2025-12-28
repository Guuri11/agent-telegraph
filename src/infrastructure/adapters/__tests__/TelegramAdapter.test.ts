import { TelegramAdapter, TelegramConfig } from '../TelegramAdapter';

// Mock node-telegram-bot-api
jest.mock('node-telegram-bot-api');

import TelegramBot from 'node-telegram-bot-api';

const MockedTelegramBot = TelegramBot as jest.MockedClass<typeof TelegramBot>;

describe('TelegramAdapter', () => {
  let mockBot: jest.Mocked<TelegramBot>;
  const validConfig: TelegramConfig = {
    botToken: 'test-token-123',
    chatId: '123456789'
  };

  beforeEach(() => {
    mockBot = {
      sendMessage: jest.fn().mockResolvedValue({}),
      getMe: jest.fn().mockResolvedValue({ username: 'test_bot' })
    } as any;

    MockedTelegramBot.mockImplementation(() => mockBot);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create adapter with valid config', () => {
      expect(() => new TelegramAdapter(validConfig)).not.toThrow();
      expect(MockedTelegramBot).toHaveBeenCalledWith(validConfig.botToken, { polling: false });
    });

    it('should throw error when bot token is empty', () => {
      const invalidConfig = { ...validConfig, botToken: '' };
      expect(() => new TelegramAdapter(invalidConfig)).toThrow('Telegram bot token is required');
    });

    it('should throw error when chat ID is empty', () => {
      const invalidConfig = { ...validConfig, chatId: '' };
      expect(() => new TelegramAdapter(invalidConfig)).toThrow('Telegram chat ID is required');
    });
  });

  describe('send', () => {
    it('should send message successfully', async () => {
      const adapter = new TelegramAdapter(validConfig);
      const message = 'Test notification';

      await adapter.send(message);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        validConfig.chatId,
        message,
        { parse_mode: 'Markdown' }
      );
    });

    it('should throw error when send fails', async () => {
      mockBot.sendMessage.mockRejectedValue(new Error('Network error'));
      const adapter = new TelegramAdapter(validConfig);

      await expect(adapter.send('Test')).rejects.toThrow('Failed to send Telegram message');
    });

    it('should send multiple messages', async () => {
      const adapter = new TelegramAdapter(validConfig);

      await adapter.send('Message 1');
      await adapter.send('Message 2');

      expect(mockBot.sendMessage).toHaveBeenCalledTimes(2);
    });
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      const adapter = new TelegramAdapter(validConfig);

      const result = await adapter.testConnection();

      expect(result).toBe(true);
      expect(mockBot.getMe).toHaveBeenCalled();
    });

    it('should return false when connection fails', async () => {
      mockBot.getMe.mockRejectedValue(new Error('Unauthorized'));
      const adapter = new TelegramAdapter(validConfig);

      const result = await adapter.testConnection();

      expect(result).toBe(false);
    });
  });
});
