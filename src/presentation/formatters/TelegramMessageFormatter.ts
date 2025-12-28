import { AgentEvent } from '../../domain/entities/AgentEvent';

/**
 * TelegramMessageFormatter
 * Formats AgentEvent entities into Telegram-compatible markdown messages
 * This belongs to the Presentation layer - NOT the domain
 */
export class TelegramMessageFormatter {
  /**
   * Formats an AgentEvent into a Telegram message
   */
  format(event: AgentEvent): string {
    const time = event.timestamp.toLocaleString('es-ES');
    const emoji = this.getEmojiForEvent(event);
    const title = this.getEventTitle(event);

    let message = `${emoji} *${title}*\n\n`;
    message += `*Agent:* ${event.agentName.toString()}\n`;

    // Add metadata fields if present
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

    message += `\n_${time}_`;
    return message;
  }

  private getEmojiForEvent(event: AgentEvent): string {
    if (event.isAgentStarted()) return '🚀';
    if (event.isAgentStopped()) return '✅';
    if (event.isTaskCompleted()) return '🎯';
    if (event.isToolUsed()) return '🔧';
    if (event.isErrorOccurred()) return '❌';
    if (event.isWaitingForInput()) return '⏸️';
    return '📢';
  }

  private getEventTitle(event: AgentEvent): string {
    if (event.isAgentStarted()) return 'Agent Started';
    if (event.isAgentStopped()) return 'Agent Finished';
    if (event.isTaskCompleted()) return 'Task Completed';
    if (event.isToolUsed()) return 'Tool Used';
    if (event.isErrorOccurred()) return 'Error Occurred';
    if (event.isWaitingForInput()) return 'Waiting for Input';
    return 'Agent Event';
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
