import { AgentEvent } from '../../domain/entities/AgentEvent';
import { EventType } from '../../domain/value-objects/EventType';

/**
 * EventFilterCriteria
 * Defines the criteria for filtering events
 */
export interface EventFilterCriteria {
  agentNames?: string[];
  eventTypes?: EventType[];
}

/**
 * EventFilterService
 * Application service for filtering events based on criteria
 */
export class EventFilterService {
  constructor(private readonly criteria?: EventFilterCriteria) {}

  /**
   * Determines if an event should be processed based on filter criteria
   * Returns true if the event matches the criteria (or if no criteria is set)
   * Multiple criteria are combined with AND logic
   */
  shouldProcess(event: AgentEvent): boolean {
    // If no criteria, accept all events
    if (!this.criteria) {
      return true;
    }

    // Check agent name filter
    if (this.criteria.agentNames && this.criteria.agentNames.length > 0) {
      if (!this.matchesAgentName(event)) {
        return false;
      }
    }

    // Check event type filter
    if (this.criteria.eventTypes && this.criteria.eventTypes.length > 0) {
      if (!this.matchesEventType(event)) {
        return false;
      }
    }

    return true;
  }

  private matchesAgentName(event: AgentEvent): boolean {
    if (!this.criteria?.agentNames || this.criteria.agentNames.length === 0) {
      return true;
    }

    const eventAgentName = event.agentName.value.toLowerCase();

    return this.criteria.agentNames.some(allowedName =>
      eventAgentName.includes(allowedName.toLowerCase())
    );
  }

  private matchesEventType(event: AgentEvent): boolean {
    if (!this.criteria?.eventTypes || this.criteria.eventTypes.length === 0) {
      return true;
    }

    return this.criteria.eventTypes.some(allowedType =>
      event.eventType.equals(allowedType)
    );
  }
}
