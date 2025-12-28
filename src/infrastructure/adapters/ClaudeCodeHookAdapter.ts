import { AgentMonitor, AgentEventHandler } from '../../domain/ports/AgentMonitor';
import { AgentEventFactory } from '../../domain/entities/AgentEvent';

/**
 * Extracts the last meaningful message from a JSONL transcript
 */
function extractLastMeaningfulMessage(transcriptContent: string): string | undefined {
  try {
    const lines = transcriptContent.split('\n').filter(line => line.trim());

    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (!entry.type) continue;

        if (entry.type === 'assistant' && entry.text) {
          const text = entry.text.trim();
          return text.length > 300 ? text.substring(0, 300) + '...' : text;
        }

        if (entry.type === 'tool_result' && entry.content) {
          const content = typeof entry.content === 'string'
            ? entry.content
            : JSON.stringify(entry.content);
          const text = content.trim();
          return text.length > 300 ? text.substring(0, 300) + '...' : text;
        }
      } catch (parseError) {
        continue;
      }
    }

    return undefined;
  } catch (error) {
    console.error('[ClaudeCodeHook] Error parsing transcript:', error);
    return undefined;
  }
}

/**
 * Adapter for Claude Code hooks
 * This should be registered as a Claude Code hook script
 */
export class ClaudeCodeHookAdapter implements AgentMonitor {
  private handlers: AgentEventHandler[] = [];
  private isActive = false;
  private startTime?: Date;

  async start(): Promise<void> {
    this.isActive = true;
    this.startTime = new Date();
    console.log('[ClaudeCodeHook] Monitor started');
  }

  stop(): void {
    this.isActive = false;
    console.log('[ClaudeCodeHook] Monitor stopped');
  }

  onEvent(handler: AgentEventHandler): void {
    this.handlers.push(handler);
  }

  isRunning(): boolean {
    return this.isActive;
  }

  /**
   * This method should be called from the Claude Code hook script
   * when the 'stop' event is triggered
   */
  async handleStopEvent(hookData?: any): Promise<void> {
    if (!this.isActive) {
      return;
    }

    const duration = this.startTime
      ? Date.now() - this.startTime.getTime()
      : undefined;

    const event = AgentEventFactory.createStopEvent(
      'Claude Code',
      hookData?.taskDescription,
      duration
    );

    await this.notifyHandlers(event);
  }

  /**
   * This method should be called from the Claude Code hook script
   * when the 'session_start' event is triggered
   */
  async handleStartEvent(hookData?: any): Promise<void> {
    if (!this.isActive) {
      return;
    }

    this.startTime = new Date();

    const event = AgentEventFactory.createStartEvent(
      'Claude Code',
      hookData?.taskDescription
    );

    await this.notifyHandlers(event);
  }

  /**
   * This method should be called from the Claude Code hook script
   * when the 'post_tool_use' event is triggered
   */
  async handleToolUseEvent(toolName: string, metadata?: any): Promise<void> {
    if (!this.isActive) {
      return;
    }

    const event = AgentEventFactory.createToolUseEvent(
      'Claude Code',
      toolName,
      metadata
    );

    await this.notifyHandlers(event);
  }

  /**
   * This method should be called from the Claude Code hook script
   * when the 'notification' event is triggered (e.g., idle_prompt)
   */
  async handleNotificationEvent(hookData?: any): Promise<void> {
    if (!this.isActive) {
      return;
    }

    // Only process notifications that indicate the agent is waiting for input
    const notificationType = hookData?.notification_type;
    const message = hookData?.message || 'Agent notification';
    const title = hookData?.title;
    const projectPath = hookData?.cwd;
    
    // Try to extract last output from transcript if available
    let lastOutput: string | undefined;
    if (hookData?.transcript_path) {
      try {
        const fs = require('fs');
        const transcriptContent = fs.readFileSync(hookData.transcript_path, 'utf-8');
        lastOutput = extractLastMeaningfulMessage(transcriptContent);
      } catch (error) {
        console.error('[ClaudeCodeHook] Could not read transcript:', error);
      }
    }

    const event = AgentEventFactory.createNotificationEvent(
      'Claude Code',
      message,
      notificationType,
      title,
      projectPath,
      lastOutput
    );

    await this.notifyHandlers(event);
  }

  private async notifyHandlers(event: any): Promise<void> {
    for (const handler of this.handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error('[ClaudeCodeHook] Error in event handler:', error);
      }
    }
  }
}
