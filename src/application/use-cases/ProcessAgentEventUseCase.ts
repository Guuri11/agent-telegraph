import { AgentEvent } from '../../domain/entities/AgentEvent';
import { EventNotifier } from '../../domain/ports/EventNotifier';
import { TelegramMessageFormatter } from '../../presentation/formatters/TelegramMessageFormatter';

/**
 * ProcessAgentEventUseCase
 * Application layer use case for processing agent events
 * Orchestrates: formatting and sending notifications
 */
export class ProcessAgentEventUseCase {
  constructor(
    private readonly notifier: EventNotifier,
    private readonly formatter: TelegramMessageFormatter
  ) {}

  /**
   * Processes an agent event by formatting and sending it
   */
  async execute(event: AgentEvent): Promise<void> {
    const message = this.formatter.format(event);
    await this.notifier.notify(message);
  }
}
