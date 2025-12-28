import { EventFilterService, EventFilterCriteria } from '../EventFilterService';
import { AgentEvent } from '../../../domain/entities/AgentEvent';
import { AgentName } from '../../../domain/value-objects/AgentName';
import { EventMetadata } from '../../../domain/value-objects/EventMetadata';
import { EventType } from '../../../domain/value-objects/EventType';

describe('EventFilterService', () => {
  describe('without filters', () => {
    it('should accept all events when no criteria is provided', () => {
      const service = new EventFilterService();
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(true);
    });

    it('should accept all events when criteria is undefined', () => {
      const service = new EventFilterService(undefined);
      const event = AgentEvent.agentStarted(
        AgentName.create('Any Agent'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(true);
    });
  });

  describe('with agent name filter', () => {
    it('should accept event from allowed agent', () => {
      const criteria: EventFilterCriteria = {
        agentNames: ['Claude Code']
      };
      const service = new EventFilterService(criteria);
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(true);
    });

    it('should reject event from non-allowed agent', () => {
      const criteria: EventFilterCriteria = {
        agentNames: ['Claude Code']
      };
      const service = new EventFilterService(criteria);
      const event = AgentEvent.agentStarted(
        AgentName.create('GPT-4'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(false);
    });

    it('should be case-insensitive for agent names', () => {
      const criteria: EventFilterCriteria = {
        agentNames: ['claude code']
      };
      const service = new EventFilterService(criteria);
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(true);
    });

    it('should accept partial matches for agent names', () => {
      const criteria: EventFilterCriteria = {
        agentNames: ['Claude']
      };
      const service = new EventFilterService(criteria);
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code v2'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(true);
    });

    it('should accept event matching any of multiple agent names', () => {
      const criteria: EventFilterCriteria = {
        agentNames: ['Claude Code', 'GPT-4']
      };
      const service = new EventFilterService(criteria);

      const event1 = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );
      const event2 = AgentEvent.agentStarted(
        AgentName.create('GPT-4'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event1)).toBe(true);
      expect(service.shouldProcess(event2)).toBe(true);
    });

    it('should accept all events when agent names array is empty', () => {
      const criteria: EventFilterCriteria = {
        agentNames: []
      };
      const service = new EventFilterService(criteria);
      const event = AgentEvent.agentStarted(
        AgentName.create('Any Agent'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(true);
    });
  });

  describe('with event type filter', () => {
    it('should accept event of allowed type', () => {
      const criteria: EventFilterCriteria = {
        eventTypes: [EventType.agentStopped()]
      };
      const service = new EventFilterService(criteria);
      const event = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(true);
    });

    it('should reject event of non-allowed type', () => {
      const criteria: EventFilterCriteria = {
        eventTypes: [EventType.agentStopped()]
      };
      const service = new EventFilterService(criteria);
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(false);
    });

    it('should accept event matching any of multiple types', () => {
      const criteria: EventFilterCriteria = {
        eventTypes: [EventType.agentStopped(), EventType.waitingForInput()]
      };
      const service = new EventFilterService(criteria);

      const event1 = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );
      const event2 = AgentEvent.waitingForInput(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event1)).toBe(true);
      expect(service.shouldProcess(event2)).toBe(true);
    });

    it('should accept all events when event types array is empty', () => {
      const criteria: EventFilterCriteria = {
        eventTypes: []
      };
      const service = new EventFilterService(criteria);
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(true);
    });
  });

  describe('with combined filters (AND logic)', () => {
    it('should accept event matching both agent name and event type', () => {
      const criteria: EventFilterCriteria = {
        agentNames: ['Claude Code'],
        eventTypes: [EventType.agentStopped()]
      };
      const service = new EventFilterService(criteria);
      const event = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(true);
    });

    it('should reject event matching agent name but not event type', () => {
      const criteria: EventFilterCriteria = {
        agentNames: ['Claude Code'],
        eventTypes: [EventType.agentStopped()]
      };
      const service = new EventFilterService(criteria);
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(false);
    });

    it('should reject event matching event type but not agent name', () => {
      const criteria: EventFilterCriteria = {
        agentNames: ['Claude Code'],
        eventTypes: [EventType.agentStopped()]
      };
      const service = new EventFilterService(criteria);
      const event = AgentEvent.agentStopped(
        AgentName.create('GPT-4'),
        EventMetadata.empty()
      );

      expect(service.shouldProcess(event)).toBe(false);
    });
  });
});
