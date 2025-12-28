import { AgentName } from '../AgentName';

describe('AgentName Value Object', () => {
  describe('creation', () => {
    it('should create a valid AgentName', () => {
      const name = AgentName.create('Claude Code');

      expect(name.value).toBe('Claude Code');
    });

    it('should throw error when name is empty', () => {
      expect(() => AgentName.create('')).toThrow('Agent name cannot be empty');
    });

    it('should throw error when name is only whitespace', () => {
      expect(() => AgentName.create('   ')).toThrow('Agent name cannot be empty');
    });

    it('should trim whitespace from name', () => {
      const name = AgentName.create('  Claude Code  ');

      expect(name.value).toBe('Claude Code');
    });

    it('should throw error when name exceeds maximum length', () => {
      const longName = 'A'.repeat(101);

      expect(() => AgentName.create(longName)).toThrow('Agent name cannot exceed 100 characters');
    });

    it('should accept name at maximum length', () => {
      const maxName = 'A'.repeat(100);
      const name = AgentName.create(maxName);

      expect(name.value).toBe(maxName);
    });
  });

  describe('equality', () => {
    it('should be equal when values are the same', () => {
      const name1 = AgentName.create('Claude Code');
      const name2 = AgentName.create('Claude Code');

      expect(name1.equals(name2)).toBe(true);
    });

    it('should not be equal when values differ', () => {
      const name1 = AgentName.create('Claude Code');
      const name2 = AgentName.create('GPT-4');

      expect(name1.equals(name2)).toBe(false);
    });

    it('should be case-sensitive', () => {
      const name1 = AgentName.create('Claude Code');
      const name2 = AgentName.create('claude code');

      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of value', () => {
      const name = AgentName.create('Claude Code');

      // TypeScript will prevent this at compile time, but we test runtime behavior
      expect(() => {
        (name as any).value = 'Modified';
      }).toThrow();
    });
  });

  describe('toString', () => {
    it('should return the string value', () => {
      const name = AgentName.create('Claude Code');

      expect(name.toString()).toBe('Claude Code');
    });
  });
});
