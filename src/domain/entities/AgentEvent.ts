export enum AgentEventType {
  AGENT_STARTED = 'agent_started',
  AGENT_STOPPED = 'agent_stopped',
  TASK_COMPLETED = 'task_completed',
  TOOL_USED = 'tool_used',
  ERROR_OCCURRED = 'error_occurred',
  WAITING_FOR_INPUT = 'waiting_for_input'
}

export interface AgentEvent {
  type: AgentEventType;
  agentName: string;
  timestamp: Date;
  metadata?: {
    taskDescription?: string;
    duration?: number;
    toolName?: string;
    error?: string;
    message?: string;
    notificationType?: string;
    title?: string;
    projectPath?: string;
    lastOutput?: string;
    [key: string]: any;
  };
}

export class AgentEventFactory {
  static createStopEvent(
    agentName: string,
    taskDescription?: string,
    duration?: number
  ): AgentEvent {
    return {
      type: AgentEventType.AGENT_STOPPED,
      agentName,
      timestamp: new Date(),
      metadata: {
        taskDescription,
        duration
      }
    };
  }

  static createStartEvent(
    agentName: string,
    taskDescription?: string
  ): AgentEvent {
    return {
      type: AgentEventType.AGENT_STARTED,
      agentName,
      timestamp: new Date(),
      metadata: {
        taskDescription
      }
    };
  }

  static createToolUseEvent(
    agentName: string,
    toolName: string,
    metadata?: any
  ): AgentEvent {
    return {
      type: AgentEventType.TOOL_USED,
      agentName,
      timestamp: new Date(),
      metadata: {
        toolName,
        ...metadata
      }
    };
  }

  static createNotificationEvent(
    agentName: string,
    message: string,
    notificationType: string,
    title?: string,
    projectPath?: string,
    lastOutput?: string
  ): AgentEvent {
    return {
      type: AgentEventType.WAITING_FOR_INPUT,
      agentName,
      timestamp: new Date(),
      metadata: {
        message,
        notificationType,
        title,
        projectPath,
        lastOutput
      }
    };
  }
}
