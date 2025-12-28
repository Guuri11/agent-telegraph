import TelegramBot from 'node-telegram-bot-api';
import { EventNotifier } from '../../domain/services/AgentEventService';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export class TelegramAdapter implements EventNotifier {
  private bot: TelegramBot;
  private chatId: string;

  constructor(config: TelegramConfig) {
    this.validateConfig(config);
    this.bot = new TelegramBot(config.botToken, { polling: false });
    this.chatId = config.chatId;
  }

  private validateConfig(config: TelegramConfig): void {
    if (!config.botToken || config.botToken.trim() === '') {
      throw new Error('Telegram bot token is required');
    }
    if (!config.chatId || config.chatId.trim() === '') {
      throw new Error('Telegram chat ID is required');
    }
  }

  async send(message: string): Promise<void> {
    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send Telegram message: ${errorMessage}`);
    }
  }

  // Implement EventNotifier interface (same as send for Telegram)
  async notify(message: string): Promise<void> {
    return this.send(message);
  }

  async testConnection(): Promise<boolean> {
    try {
      const me = await this.bot.getMe();
      return !!me.username;
    } catch (error) {
      return false;
    }
  }
}
