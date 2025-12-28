import { EventType } from '../EventType';

describe('EventType Value Object', () => {
  describe('creation', () => {
    it('should create AGENT_STARTED event type', () => {
      const eventType = EventType.agentStarted();

      expect(eventType.value).toBe('agent_started');
    });

    it('should create AGENT_STOPPED event type', () => {
      const eventType = EventType.agentStopped();

      expect(eventType.value).toBe('agent_stopped');
    });

    it('should create TASK_COMPLETED event type', () => {
      const eventType = EventType.taskCompleted();

      expect(eventType.value).toBe('task_completed');
    });

    it('should create TOOL_USED event type', () => {
      const eventType = EventType.toolUsed();

      expect(eventType.value).toBe('tool_used');
    });

    it('should create ERROR_OCCURRED event type', () => {
      const eventType = EventType.errorOccurred();

      expect(eventType.value).toBe('error_occurred');
    });

    it('should create WAITING_FOR_INPUT event type', () => {
      const eventType = EventType.waitingForInput();

      expect(eventType.value).toBe('waiting_for_input');
    });

    it('should create from string value', () => {
      const eventType = EventType.fromString('agent_started');

      expect(eventType.value).toBe('agent_started');
    });

    it('should throw error for invalid string value', () => {
      expect(() => EventType.fromString('invalid_type')).toThrow('Invalid event type: invalid_type');
    });

    it('should throw error for empty string', () => {
      expect(() => EventType.fromString('')).toThrow('Invalid event type: ');
    });
  });

  describe('equality', () => {
    it('should be equal when values are the same', () => {
      const type1 = EventType.agentStarted();
      const type2 = EventType.agentStarted();

      expect(type1.equals(type2)).toBe(true);
    });

    it('should not be equal when values differ', () => {
      const type1 = EventType.agentStarted();
      const type2 = EventType.agentStopped();

      expect(type1.equals(type2)).toBe(false);
    });
  });

  describe('type checks', () => {
    it('should correctly identify agent started type', () => {
      const eventType = EventType.agentStarted();

      expect(eventType.isAgentStarted()).toBe(true);
      expect(eventType.isAgentStopped()).toBe(false);
    });

    it('should correctly identify agent stopped type', () => {
      const eventType = EventType.agentStopped();

      expect(eventType.isAgentStopped()).toBe(true);
      expect(eventType.isAgentStarted()).toBe(false);
    });

    it('should correctly identify waiting for input type', () => {
      const eventType = EventType.waitingForInput();

      expect(eventType.isWaitingForInput()).toBe(true);
      expect(eventType.isAgentStarted()).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of value', () => {
      const eventType = EventType.agentStarted();

      expect(() => {
        (eventType as any).value = 'modified';
      }).toThrow();
    });
  });

  describe('toString', () => {
    it('should return the string value', () => {
      const eventType = EventType.agentStarted();

      expect(eventType.toString()).toBe('agent_started');
    });
  });

  describe('all valid types', () => {
    it('should return all valid event types', () => {
      const validTypes = EventType.allValidTypes();

      expect(validTypes).toEqual([
        'agent_started',
        'agent_stopped',
        'task_completed',
        'tool_used',
        'error_occurred',
        'waiting_for_input'
      ]);
    });
  });
});
