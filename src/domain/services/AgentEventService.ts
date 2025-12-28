import { AgentEvent, AgentEventType } from '../entities/AgentEvent';

export interface EventNotifier {
  notify(message: string): Promise<void>;
}

export interface EventFilter {
  eventTypes?: AgentEventType[];
  agentNames?: string[];
}

export class AgentEventService {
  constructor(
    private readonly notifier: EventNotifier,
    private readonly filter?: EventFilter
  ) {}

  async processEvent(event: AgentEvent): Promise<void> {
    if (!this.shouldProcess(event)) {
      return;
    }

    const message = this.formatMessage(event);
    await this.notifier.notify(message);
  }

  private shouldProcess(event: AgentEvent): boolean {
    if (!this.filter) {
      return true;
    }

    if (this.filter.eventTypes && this.filter.eventTypes.length > 0) {
      if (!this.filter.eventTypes.includes(event.type)) {
        return false;
      }
    }

    if (this.filter.agentNames && this.filter.agentNames.length > 0) {
      const agentNameNormalized = event.agentName.toLowerCase();
      const agentMatch = this.filter.agentNames.some(name =>
        agentNameNormalized.includes(name.toLowerCase())
      );
      if (!agentMatch) {
        return false;
      }
    }

    return true;
  }

  private formatMessage(event: AgentEvent): string {
    const time = event.timestamp.toLocaleTimeString('es-ES');
    const emoji = this.getEmojiForEventType(event.type);

    let message = `${emoji} *${this.getEventTitle(event.type)}*\n\n`;
    message += `*Agent:* ${event.agentName}\n`;

    if (event.metadata) {
      if (event.metadata.taskDescription) {
        message += `*Task:* ${event.metadata.taskDescription}\n`;
      }
      if (event.metadata.duration !== undefined) {
        message += `*Duration:* ${this.formatDuration(event.metadata.duration)}\n`;
      }
      if (event.metadata.toolName) {
        message += `*Tool:* ${event.metadata.toolName}\n`;
      }
      if (event.metadata.error) {
        message += `*Error:* ${event.metadata.error}\n`;
      }
      if (event.metadata.projectPath) {
        message += `*Project:* ${event.metadata.projectPath}\n`;
      }
      if (event.metadata.message) {
        message += `*Message:* ${event.metadata.message}\n`;
      }
      if (event.metadata.lastOutput) {
        // Truncate last output if too long
        const output = event.metadata.lastOutput.length > 500 
          ? event.metadata.lastOutput.substring(0, 500) + '...'
          : event.metadata.lastOutput;
        message += `\n*Last Output:*\n\`\`\`\n${output}\n\`\`\`\n`;
      }
    }

    message += `\n_${time}_`;
    return message;
  }

  private getEmojiForEventType(type: AgentEventType): string {
    switch (type) {
      case AgentEventType.AGENT_STARTED:
        return '🚀';
      case AgentEventType.AGENT_STOPPED:
        return '✅';
      case AgentEventType.TASK_COMPLETED:
        return '🎯';
      case AgentEventType.TOOL_USED:
        return '🔧';
      case AgentEventType.ERROR_OCCURRED:
        return '❌';
      case AgentEventType.WAITING_FOR_INPUT:
        return '⏸️';
      default:
        return '📢';
    }
  }

  private getEventTitle(type: AgentEventType): string {
    switch (type) {
      case AgentEventType.AGENT_STARTED:
        return 'Agent Started';
      case AgentEventType.AGENT_STOPPED:
        return 'Agent Finished';
      case AgentEventType.TASK_COMPLETED:
        return 'Task Completed';
      case AgentEventType.TOOL_USED:
        return 'Tool Used';
      case AgentEventType.ERROR_OCCURRED:
        return 'Error Occurred';
      case AgentEventType.WAITING_FOR_INPUT:
        return 'Waiting for Input';
      default:
        return 'Agent Event';
    }
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
