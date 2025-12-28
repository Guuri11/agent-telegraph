import { EventMetadata } from '../EventMetadata';

describe('EventMetadata Value Object', () => {
  describe('creation', () => {
    it('should create empty metadata', () => {
      const metadata = EventMetadata.empty();

      expect(metadata.isEmpty()).toBe(true);
      expect(metadata.taskDescription).toBeUndefined();
      expect(metadata.duration).toBeUndefined();
    });

    it('should create metadata with task description', () => {
      const metadata = EventMetadata.create({ taskDescription: 'Implement feature' });

      expect(metadata.taskDescription).toBe('Implement feature');
    });

    it('should create metadata with duration', () => {
      const metadata = EventMetadata.create({ duration: 5000 });

      expect(metadata.duration).toBe(5000);
    });

    it('should create metadata with tool name', () => {
      const metadata = EventMetadata.create({ toolName: 'npm' });

      expect(metadata.toolName).toBe('npm');
    });

    it('should create metadata with error', () => {
      const metadata = EventMetadata.create({ error: 'Connection failed' });

      expect(metadata.error).toBe('Connection failed');
    });

    it('should create metadata with message', () => {
      const metadata = EventMetadata.create({ message: 'Waiting for user input' });

      expect(metadata.message).toBe('Waiting for user input');
    });

    it('should create metadata with all fields', () => {
      const metadata = EventMetadata.create({
        taskDescription: 'Task 1',
        duration: 3000,
        toolName: 'npm',
        error: 'Error msg',
        message: 'Message',
        notificationType: 'info',
        title: 'Title',
        projectPath: '/path/to/project',
        lastOutput: 'Output text'
      });

      expect(metadata.taskDescription).toBe('Task 1');
      expect(metadata.duration).toBe(3000);
      expect(metadata.toolName).toBe('npm');
      expect(metadata.error).toBe('Error msg');
      expect(metadata.message).toBe('Message');
      expect(metadata.notificationType).toBe('info');
      expect(metadata.title).toBe('Title');
      expect(metadata.projectPath).toBe('/path/to/project');
      expect(metadata.lastOutput).toBe('Output text');
    });
  });

  describe('validation', () => {
    it('should throw error when duration is negative', () => {
      expect(() => EventMetadata.create({ duration: -100 })).toThrow('Duration cannot be negative');
    });

    it('should accept zero duration', () => {
      const metadata = EventMetadata.create({ duration: 0 });

      expect(metadata.duration).toBe(0);
    });

    it('should trim task description whitespace', () => {
      const metadata = EventMetadata.create({ taskDescription: '  Task  ' });

      expect(metadata.taskDescription).toBe('Task');
    });

    it('should trim message whitespace', () => {
      const metadata = EventMetadata.create({ message: '  Message  ' });

      expect(metadata.message).toBe('Message');
    });

    it('should treat empty string task description as undefined', () => {
      const metadata = EventMetadata.create({ taskDescription: '   ' });

      expect(metadata.taskDescription).toBeUndefined();
    });

    it('should throw error when task description exceeds max length', () => {
      const longDescription = 'A'.repeat(1001);

      expect(() => EventMetadata.create({ taskDescription: longDescription }))
        .toThrow('Task description cannot exceed 1000 characters');
    });

    it('should throw error when message exceeds max length', () => {
      const longMessage = 'A'.repeat(1001);

      expect(() => EventMetadata.create({ message: longMessage }))
        .toThrow('Message cannot exceed 1000 characters');
    });

    it('should throw error when lastOutput exceeds max length', () => {
      const longOutput = 'A'.repeat(5001);

      expect(() => EventMetadata.create({ lastOutput: longOutput }))
        .toThrow('Last output cannot exceed 5000 characters');
    });
  });

  describe('equality', () => {
    it('should be equal when all fields are the same', () => {
      const metadata1 = EventMetadata.create({ taskDescription: 'Task', duration: 1000 });
      const metadata2 = EventMetadata.create({ taskDescription: 'Task', duration: 1000 });

      expect(metadata1.equals(metadata2)).toBe(true);
    });

    it('should not be equal when task descriptions differ', () => {
      const metadata1 = EventMetadata.create({ taskDescription: 'Task 1' });
      const metadata2 = EventMetadata.create({ taskDescription: 'Task 2' });

      expect(metadata1.equals(metadata2)).toBe(false);
    });

    it('should not be equal when durations differ', () => {
      const metadata1 = EventMetadata.create({ duration: 1000 });
      const metadata2 = EventMetadata.create({ duration: 2000 });

      expect(metadata1.equals(metadata2)).toBe(false);
    });

    it('should be equal when both are empty', () => {
      const metadata1 = EventMetadata.empty();
      const metadata2 = EventMetadata.empty();

      expect(metadata1.equals(metadata2)).toBe(true);
    });
  });

  describe('isEmpty', () => {
    it('should return true when no fields are set', () => {
      const metadata = EventMetadata.create({});

      expect(metadata.isEmpty()).toBe(true);
    });

    it('should return false when at least one field is set', () => {
      const metadata = EventMetadata.create({ taskDescription: 'Task' });

      expect(metadata.isEmpty()).toBe(false);
    });
  });

  describe('hasTaskDescription', () => {
    it('should return true when task description is set', () => {
      const metadata = EventMetadata.create({ taskDescription: 'Task' });

      expect(metadata.hasTaskDescription()).toBe(true);
    });

    it('should return false when task description is not set', () => {
      const metadata = EventMetadata.empty();

      expect(metadata.hasTaskDescription()).toBe(false);
    });
  });

  describe('hasDuration', () => {
    it('should return true when duration is set', () => {
      const metadata = EventMetadata.create({ duration: 1000 });

      expect(metadata.hasDuration()).toBe(true);
    });

    it('should return false when duration is not set', () => {
      const metadata = EventMetadata.empty();

      expect(metadata.hasDuration()).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of fields', () => {
      const metadata = EventMetadata.create({ taskDescription: 'Task' });

      expect(() => {
        (metadata as any).taskDescription = 'Modified';
      }).toThrow();
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with all fields', () => {
      const metadata = EventMetadata.create({
        taskDescription: 'Task',
        duration: 1000,
        toolName: 'npm'
      });

      const json = metadata.toJSON();

      expect(json).toEqual({
        taskDescription: 'Task',
        duration: 1000,
        toolName: 'npm'
      });
    });

    it('should omit undefined fields from JSON', () => {
      const metadata = EventMetadata.create({ taskDescription: 'Task' });

      const json = metadata.toJSON();

      expect(json).toEqual({ taskDescription: 'Task' });
      expect(json.duration).toBeUndefined();
    });
  });
});
