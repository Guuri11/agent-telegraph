import { AgentEvent } from '../entities/AgentEvent';

/**
 * Port for monitoring AI agents
 * Adapters should implement this interface to monitor different AI agents
 */
export interface AgentMonitor {
  /**
   * Start monitoring the agent
   */
  start(): Promise<void>;

  /**
   * Stop monitoring the agent
   */
  stop(): void;

  /**
   * Register a handler for agent events
   */
  onEvent(handler: AgentEventHandler): void;

  /**
   * Check if the monitor is running
   */
  isRunning(): boolean;
}

export type AgentEventHandler = (event: AgentEvent) => void | Promise<void>;
