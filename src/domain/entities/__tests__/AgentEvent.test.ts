import { AgentEvent } from '../AgentEvent';
import { AgentName } from '../../value-objects/AgentName';
import { EventType } from '../../value-objects/EventType';
import { EventTimestamp } from '../../value-objects/EventTimestamp';
import { EventMetadata } from '../../value-objects/EventMetadata';

describe('AgentEvent Entity', () => {
  describe('creation via factory methods', () => {
    it('should create event with required fields', () => {
      const agentName = AgentName.create('Claude Code');
      const eventType = EventType.agentStarted();
      const timestamp = EventTimestamp.now();
      const metadata = EventMetadata.empty();

      const event = AgentEvent.create({
        agentName,
        eventType,
        timestamp,
        metadata
      });

      expect(event.agentName).toBe(agentName);
      expect(event.eventType).toBe(eventType);
      expect(event.timestamp).toBe(timestamp);
      expect(event.metadata).toBe(metadata);
    });

    it('should create agent started event', () => {
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.create({ taskDescription: 'Implement feature' })
      );

      expect(event.eventType.isAgentStarted()).toBe(true);
      expect(event.agentName.value).toBe('Claude Code');
      expect(event.metadata.taskDescription).toBe('Implement feature');
    });

    it('should create agent stopped event', () => {
      const event = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.create({ taskDescription: 'Task completed', duration: 5000 })
      );

      expect(event.eventType.isAgentStopped()).toBe(true);
      expect(event.metadata.duration).toBe(5000);
    });

    it('should create waiting for input event', () => {
      const event = AgentEvent.waitingForInput(
        AgentName.create('Claude Code'),
        EventMetadata.create({ message: 'Waiting for user' })
      );

      expect(event.eventType.isWaitingForInput()).toBe(true);
      expect(event.metadata.message).toBe('Waiting for user');
    });

    it('should create tool used event', () => {
      const event = AgentEvent.toolUsed(
        AgentName.create('Claude Code'),
        EventMetadata.create({ toolName: 'npm' })
      );

      expect(event.eventType.isToolUsed()).toBe(true);
      expect(event.metadata.toolName).toBe('npm');
    });

    it('should create error occurred event', () => {
      const event = AgentEvent.errorOccurred(
        AgentName.create('Claude Code'),
        EventMetadata.create({ error: 'Connection failed' })
      );

      expect(event.eventType.isErrorOccurred()).toBe(true);
      expect(event.metadata.error).toBe('Connection failed');
    });

    it('should create task completed event', () => {
      const event = AgentEvent.taskCompleted(
        AgentName.create('Claude Code'),
        EventMetadata.create({ taskDescription: 'Feature implemented' })
      );

      expect(event.eventType.isTaskCompleted()).toBe(true);
    });
  });

  describe('validation', () => {
    it('should throw error when agent name is missing', () => {
      expect(() => AgentEvent.create({
        agentName: null as any,
        eventType: EventType.agentStarted(),
        timestamp: EventTimestamp.now(),
        metadata: EventMetadata.empty()
      })).toThrow('Agent name is required');
    });

    it('should throw error when event type is missing', () => {
      expect(() => AgentEvent.create({
        agentName: AgentName.create('Claude Code'),
        eventType: null as any,
        timestamp: EventTimestamp.now(),
        metadata: EventMetadata.empty()
      })).toThrow('Event type is required');
    });

    it('should throw error when timestamp is missing', () => {
      expect(() => AgentEvent.create({
        agentName: AgentName.create('Claude Code'),
        eventType: EventType.agentStarted(),
        timestamp: null as any,
        metadata: EventMetadata.empty()
      })).toThrow('Timestamp is required');
    });

    it('should throw error when metadata is missing', () => {
      expect(() => AgentEvent.create({
        agentName: AgentName.create('Claude Code'),
        eventType: EventType.agentStarted(),
        timestamp: EventTimestamp.now(),
        metadata: null as any
      })).toThrow('Metadata is required');
    });
  });

  describe('equality', () => {
    it('should be equal when all properties are the same', () => {
      const agentName = AgentName.create('Claude Code');
      const eventType = EventType.agentStarted();
      const timestamp = EventTimestamp.fromDate(new Date('2024-01-15T10:30:00Z'));
      const metadata = EventMetadata.create({ taskDescription: 'Task' });

      const event1 = AgentEvent.create({ agentName, eventType, timestamp, metadata });
      const event2 = AgentEvent.create({ agentName, eventType, timestamp, metadata });

      expect(event1.equals(event2)).toBe(true);
    });

    it('should not be equal when agent names differ', () => {
      const timestamp = EventTimestamp.now();
      const eventType = EventType.agentStarted();
      const metadata = EventMetadata.empty();

      const event1 = AgentEvent.create({
        agentName: AgentName.create('Claude Code'),
        eventType,
        timestamp,
        metadata
      });
      const event2 = AgentEvent.create({
        agentName: AgentName.create('GPT-4'),
        eventType,
        timestamp,
        metadata
      });

      expect(event1.equals(event2)).toBe(false);
    });

    it('should not be equal when timestamps differ', () => {
      const agentName = AgentName.create('Claude Code');
      const eventType = EventType.agentStarted();
      const metadata = EventMetadata.empty();

      const event1 = AgentEvent.create({
        agentName,
        eventType,
        timestamp: EventTimestamp.fromDate(new Date('2024-01-15T10:30:00Z')),
        metadata
      });
      const event2 = AgentEvent.create({
        agentName,
        eventType,
        timestamp: EventTimestamp.fromDate(new Date('2024-01-15T10:31:00Z')),
        metadata
      });

      expect(event1.equals(event2)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of agent name', () => {
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(() => {
        (event as any).agentName = AgentName.create('Modified');
      }).toThrow();
    });

    it('should not allow modification of event type', () => {
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(() => {
        (event as any).eventType = EventType.agentStopped();
      }).toThrow();
    });
  });

  describe('type checks', () => {
    it('should correctly identify agent started event', () => {
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(event.isAgentStarted()).toBe(true);
      expect(event.isAgentStopped()).toBe(false);
      expect(event.isWaitingForInput()).toBe(false);
    });

    it('should correctly identify agent stopped event', () => {
      const event = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(event.isAgentStopped()).toBe(true);
      expect(event.isAgentStarted()).toBe(false);
    });

    it('should correctly identify waiting for input event', () => {
      const event = AgentEvent.waitingForInput(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(event.isWaitingForInput()).toBe(true);
      expect(event.isAgentStarted()).toBe(false);
    });
  });

  describe('metadata queries', () => {
    it('should check if event has task description', () => {
      const eventWithTask = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.create({ taskDescription: 'Task' })
      );
      const eventWithoutTask = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(eventWithTask.hasTaskDescription()).toBe(true);
      expect(eventWithoutTask.hasTaskDescription()).toBe(false);
    });

    it('should check if event has duration', () => {
      const eventWithDuration = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.create({ duration: 5000 })
      );
      const eventWithoutDuration = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      expect(eventWithDuration.hasDuration()).toBe(true);
      expect(eventWithoutDuration.hasDuration()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.create({ taskDescription: 'Task' })
      );

      const json = event.toJSON();

      expect(json.agentName).toBe('Claude Code');
      expect(json.eventType).toBe('agent_started');
      expect(json.timestamp).toBeTruthy();
      expect(json.metadata.taskDescription).toBe('Task');
    });
  });
});
