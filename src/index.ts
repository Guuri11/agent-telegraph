import { ConfigLoader } from './config/ConfigLoader';
import { TelegramAdapter } from './infrastructure/adapters/TelegramAdapter';

class Application {
  private telegramAdapter: TelegramAdapter;

  constructor() {
    console.log('🚀 Starting Agent Telegraph...');

    // Load configuration
    const config = ConfigLoader.load();
    console.log('✓ Configuration loaded');

    // Initialize Telegram adapter
    this.telegramAdapter = new TelegramAdapter(config.telegram);
    console.log('✓ Telegram adapter initialized');

    if (config.agentFilters) {
      console.log('✓ Agent filters enabled:', {
        agents: config.agentFilters.agentNames,
        eventTypes: config.agentFilters.eventTypes
      });
    } else {
      console.log('✓ No filters applied - forwarding all agent events');
    }
  }

  async start(): Promise<void> {
    try {
      // Test Telegram connection
      console.log('Testing Telegram connection...');
      const isConnected = await this.telegramAdapter.testConnection();

      if (!isConnected) {
        throw new Error('Failed to connect to Telegram. Please check your bot token.');
      }
      console.log('✓ Telegram connection successful');

      // Send startup notification
      await this.telegramAdapter.send(
        '🟢 *Agent Telegraph Started*\n\n' +
        'AI agent events will now be forwarded to this chat.\n\n' +
        `_Started at ${new Date().toLocaleString('es-ES')}_`
      );

      console.log('\n👀 Ready to receive agent events via hooks...\n');
      console.log('Agent events will be sent via:');
      console.log('  - Claude Code hooks (configured in .claude/settings.local.json)');
      console.log('\nPress Ctrl+C to stop.\n');

      // Keep the process alive
      // This is needed so hooks can execute and use the Telegram connection
      await this.keepAlive();

    } catch (error) {
      console.error('Failed to start application:', error);
      throw error;
    }
  }

  private async keepAlive(): Promise<void> {
    // Keep the process running indefinitely
    return new Promise(() => {
      // This promise never resolves, keeping the process alive
    });
  }

  async stop(): Promise<void> {
    console.log('\n🛑 Stopping Agent Telegraph...');

    try {
      await this.telegramAdapter.send(
        '🔴 *Agent Telegraph Stopped*\n\n' +
        `_Stopped at ${new Date().toLocaleString('es-ES')}_`
      );
    } catch (error) {
      console.error('Failed to send stop notification:', error);
    }

    console.log('✓ Application stopped');
  }
}

async function main() {
  const app = new Application();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nReceived SIGINT signal');
    await app.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\nReceived SIGTERM signal');
    await app.stop();
    process.exit(0);
  });

  try {
    await app.start();
  } catch (error) {
    console.error('Application failed to start:', error);
    process.exit(1);
  }
}

// Run the application
if (require.main === module) {
  main();
}

export { Application };
