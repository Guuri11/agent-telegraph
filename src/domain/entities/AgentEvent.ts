import { AgentName } from '../value-objects/AgentName';
import { EventType } from '../value-objects/EventType';
import { EventTimestamp } from '../value-objects/EventTimestamp';
import { EventMetadata } from '../value-objects/EventMetadata';

/**
 * AgentEvent Entity
 * Represents an event from an AI agent with full validation and immutability
 */
export interface AgentEventProps {
  agentName: AgentName;
  eventType: EventType;
  timestamp: EventTimestamp;
  metadata: EventMetadata;
}

export class AgentEvent {
  private readonly _agentName: AgentName;
  private readonly _eventType: EventType;
  private readonly _timestamp: EventTimestamp;
  private readonly _metadata: EventMetadata;

  private constructor(props: AgentEventProps) {
    this._agentName = props.agentName;
    this._eventType = props.eventType;
    this._timestamp = props.timestamp;
    this._metadata = props.metadata;
    Object.freeze(this);
  }

  /**
   * Creates a new AgentEvent with validation
   * @throws Error if any required field is missing
   */
  static create(props: AgentEventProps): AgentEvent {
    if (!props.agentName) {
      throw new Error('Agent name is required');
    }
    if (!props.eventType) {
      throw new Error('Event type is required');
    }
    if (!props.timestamp) {
      throw new Error('Timestamp is required');
    }
    if (!props.metadata) {
      throw new Error('Metadata is required');
    }

    return new AgentEvent(props);
  }

  // Factory methods for specific event types

  /**
   * Creates an agent started event
   */
  static agentStarted(agentName: AgentName, metadata: EventMetadata): AgentEvent {
    return AgentEvent.create({
      agentName,
      eventType: EventType.agentStarted(),
      timestamp: EventTimestamp.now(),
      metadata
    });
  }

  /**
   * Creates an agent stopped event
   */
  static agentStopped(agentName: AgentName, metadata: EventMetadata): AgentEvent {
    return AgentEvent.create({
      agentName,
      eventType: EventType.agentStopped(),
      timestamp: EventTimestamp.now(),
      metadata
    });
  }

  /**
   * Creates a waiting for input event
   */
  static waitingForInput(agentName: AgentName, metadata: EventMetadata): AgentEvent {
    return AgentEvent.create({
      agentName,
      eventType: EventType.waitingForInput(),
      timestamp: EventTimestamp.now(),
      metadata
    });
  }

  /**
   * Creates a tool used event
   */
  static toolUsed(agentName: AgentName, metadata: EventMetadata): AgentEvent {
    return AgentEvent.create({
      agentName,
      eventType: EventType.toolUsed(),
      timestamp: EventTimestamp.now(),
      metadata
    });
  }

  /**
   * Creates an error occurred event
   */
  static errorOccurred(agentName: AgentName, metadata: EventMetadata): AgentEvent {
    return AgentEvent.create({
      agentName,
      eventType: EventType.errorOccurred(),
      timestamp: EventTimestamp.now(),
      metadata
    });
  }

  /**
   * Creates a task completed event
   */
  static taskCompleted(agentName: AgentName, metadata: EventMetadata): AgentEvent {
    return AgentEvent.create({
      agentName,
      eventType: EventType.taskCompleted(),
      timestamp: EventTimestamp.now(),
      metadata
    });
  }

  // Getters

  get agentName(): AgentName {
    return this._agentName;
  }

  get eventType(): EventType {
    return this._eventType;
  }

  get timestamp(): EventTimestamp {
    return this._timestamp;
  }

  get metadata(): EventMetadata {
    return this._metadata;
  }

  // Type checks (delegate to EventType)

  isAgentStarted(): boolean {
    return this._eventType.isAgentStarted();
  }

  isAgentStopped(): boolean {
    return this._eventType.isAgentStopped();
  }

  isTaskCompleted(): boolean {
    return this._eventType.isTaskCompleted();
  }

  isToolUsed(): boolean {
    return this._eventType.isToolUsed();
  }

  isErrorOccurred(): boolean {
    return this._eventType.isErrorOccurred();
  }

  isWaitingForInput(): boolean {
    return this._eventType.isWaitingForInput();
  }

  // Metadata queries (delegate to EventMetadata)

  hasTaskDescription(): boolean {
    return this._metadata.hasTaskDescription();
  }

  hasDuration(): boolean {
    return this._metadata.hasDuration();
  }

  /**
   * Checks equality with another AgentEvent
   */
  equals(other: AgentEvent): boolean {
    if (!(other instanceof AgentEvent)) {
      return false;
    }
    return this._agentName.equals(other._agentName) &&
      this._eventType.equals(other._eventType) &&
      this._timestamp.equals(other._timestamp) &&
      this._metadata.equals(other._metadata);
  }

  /**
   * Converts to a plain object for serialization
   */
  toJSON(): {
    agentName: string;
    eventType: string;
    timestamp: string;
    metadata: any;
  } {
    return {
      agentName: this._agentName.toString(),
      eventType: this._eventType.toString(),
      timestamp: this._timestamp.toISOString(),
      metadata: this._metadata.toJSON()
    };
  }
}
