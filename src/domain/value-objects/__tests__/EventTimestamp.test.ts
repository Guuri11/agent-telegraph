import { EventTimestamp } from '../EventTimestamp';

describe('EventTimestamp Value Object', () => {
  describe('creation', () => {
    it('should create timestamp with current date', () => {
      const before = new Date();
      const timestamp = EventTimestamp.now();
      const after = new Date();

      expect(timestamp.value.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp.value.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should create timestamp from valid date', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const timestamp = EventTimestamp.fromDate(date);

      expect(timestamp.value.getTime()).toBe(date.getTime());
    });

    it('should throw error when date is in the future', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour in future

      expect(() => EventTimestamp.fromDate(futureDate)).toThrow('Event timestamp cannot be in the future');
    });

    it('should throw error when date is too old', () => {
      const oldDate = new Date('1990-01-01');

      expect(() => EventTimestamp.fromDate(oldDate)).toThrow('Event timestamp is too old');
    });

    it('should accept date from 1 year ago', () => {
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const timestamp = EventTimestamp.fromDate(oneYearAgo);

      expect(timestamp.value).toEqual(oneYearAgo);
    });

    it('should create from ISO string', () => {
      const isoString = '2024-01-15T10:30:00.000Z';
      const timestamp = EventTimestamp.fromISOString(isoString);

      expect(timestamp.value.toISOString()).toBe(isoString);
    });

    it('should throw error for invalid ISO string', () => {
      expect(() => EventTimestamp.fromISOString('invalid-date')).toThrow('Invalid ISO date string');
    });
  });

  describe('equality', () => {
    it('should be equal when timestamps are the same', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const timestamp1 = EventTimestamp.fromDate(date);
      const timestamp2 = EventTimestamp.fromDate(new Date(date.getTime()));

      expect(timestamp1.equals(timestamp2)).toBe(true);
    });

    it('should not be equal when timestamps differ', () => {
      const date1 = new Date('2024-01-15T10:30:00Z');
      const date2 = new Date('2024-01-15T10:31:00Z');
      const timestamp1 = EventTimestamp.fromDate(date1);
      const timestamp2 = EventTimestamp.fromDate(date2);

      expect(timestamp1.equals(timestamp2)).toBe(false);
    });
  });

  describe('comparison', () => {
    it('should correctly compare timestamps (isBefore)', () => {
      const earlier = EventTimestamp.fromDate(new Date('2024-01-15T10:30:00Z'));
      const later = EventTimestamp.fromDate(new Date('2024-01-15T10:31:00Z'));

      expect(earlier.isBefore(later)).toBe(true);
      expect(later.isBefore(earlier)).toBe(false);
    });

    it('should correctly compare timestamps (isAfter)', () => {
      const earlier = EventTimestamp.fromDate(new Date('2024-01-15T10:30:00Z'));
      const later = EventTimestamp.fromDate(new Date('2024-01-15T10:31:00Z'));

      expect(later.isAfter(earlier)).toBe(true);
      expect(earlier.isAfter(later)).toBe(false);
    });
  });

  describe('formatting', () => {
    it('should format as ISO string', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const timestamp = EventTimestamp.fromDate(date);

      expect(timestamp.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should format as locale string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const timestamp = EventTimestamp.fromDate(date);

      const formatted = timestamp.toLocaleString('es-ES');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('immutability', () => {
    it('should not allow modification of value', () => {
      const timestamp = EventTimestamp.now();

      expect(() => {
        (timestamp as any).value = new Date();
      }).toThrow();
    });

    it('should return a copy of the date, not the original', () => {
      const originalDate = new Date('2024-01-15T10:30:00Z');
      const timestamp = EventTimestamp.fromDate(originalDate);

      // Modify the original date
      originalDate.setFullYear(2025);

      // The timestamp should not be affected
      expect(timestamp.value.getFullYear()).toBe(2024);
    });
  });

  describe('toString', () => {
    it('should return ISO string representation', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const timestamp = EventTimestamp.fromDate(date);

      expect(timestamp.toString()).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});
