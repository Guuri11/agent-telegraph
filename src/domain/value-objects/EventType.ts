/**
 * EventType Value Object
 * Represents a valid event type for AI agents
 */
export class EventType {
  private readonly _value: string;

  private static readonly VALID_TYPES = [
    'agent_started',
    'agent_stopped',
    'task_completed',
    'tool_used',
    'error_occurred',
    'waiting_for_input'
  ] as const;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  // Factory methods for each event type
  static agentStarted(): EventType {
    return new EventType('agent_started');
  }

  static agentStopped(): EventType {
    return new EventType('agent_stopped');
  }

  static taskCompleted(): EventType {
    return new EventType('task_completed');
  }

  static toolUsed(): EventType {
    return new EventType('tool_used');
  }

  static errorOccurred(): EventType {
    return new EventType('error_occurred');
  }

  static waitingForInput(): EventType {
    return new EventType('waiting_for_input');
  }

  /**
   * Creates an EventType from a string value
   * @throws Error if the value is not a valid event type
   */
  static fromString(value: string): EventType {
    if (!EventType.VALID_TYPES.includes(value as any)) {
      throw new Error(`Invalid event type: ${value}`);
    }
    return new EventType(value);
  }

  /**
   * Returns all valid event type strings
   */
  static allValidTypes(): readonly string[] {
    return EventType.VALID_TYPES;
  }

  get value(): string {
    return this._value;
  }

  // Type checking methods
  isAgentStarted(): boolean {
    return this._value === 'agent_started';
  }

  isAgentStopped(): boolean {
    return this._value === 'agent_stopped';
  }

  isTaskCompleted(): boolean {
    return this._value === 'task_completed';
  }

  isToolUsed(): boolean {
    return this._value === 'tool_used';
  }

  isErrorOccurred(): boolean {
    return this._value === 'error_occurred';
  }

  isWaitingForInput(): boolean {
    return this._value === 'waiting_for_input';
  }

  /**
   * Checks equality with another EventType
   */
  equals(other: EventType): boolean {
    if (!(other instanceof EventType)) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * Returns the string representation
   */
  toString(): string {
    return this._value;
  }
}
