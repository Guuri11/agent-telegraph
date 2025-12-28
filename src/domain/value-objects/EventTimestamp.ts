/**
 * EventTimestamp Value Object
 * Represents a valid timestamp for an event with validation
 */
export class EventTimestamp {
  private readonly _value: Date;
  private static readonly MAX_AGE_YEARS = 2;

  private constructor(value: Date) {
    // Store a copy to ensure immutability
    this._value = new Date(value.getTime());
    Object.freeze(this);
  }

  /**
   * Creates a timestamp with the current date/time
   */
  static now(): EventTimestamp {
    return new EventTimestamp(new Date());
  }

  /**
   * Creates a timestamp from a Date object
   * @throws Error if the date is invalid, in the future, or too old
   */
  static fromDate(date: Date): EventTimestamp {
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const now = Date.now();
    const timestamp = date.getTime();

    // Check if date is in the future (with 1 second tolerance for clock skew)
    if (timestamp > now + 1000) {
      throw new Error('Event timestamp cannot be in the future');
    }

    // Check if date is too old (more than MAX_AGE_YEARS)
    const maxAge = EventTimestamp.MAX_AGE_YEARS * 365 * 24 * 60 * 60 * 1000;
    if (timestamp < now - maxAge) {
      throw new Error('Event timestamp is too old');
    }

    return new EventTimestamp(date);
  }

  /**
   * Creates a timestamp from an ISO string
   * @throws Error if the string is invalid
   */
  static fromISOString(isoString: string): EventTimestamp {
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid ISO date string');
    }

    return EventTimestamp.fromDate(date);
  }

  /**
   * Returns a copy of the Date value to preserve immutability
   */
  get value(): Date {
    return new Date(this._value.getTime());
  }

  /**
   * Checks equality with another EventTimestamp
   */
  equals(other: EventTimestamp): boolean {
    if (!(other instanceof EventTimestamp)) {
      return false;
    }
    return this._value.getTime() === other._value.getTime();
  }

  /**
   * Checks if this timestamp is before another
   */
  isBefore(other: EventTimestamp): boolean {
    return this._value.getTime() < other._value.getTime();
  }

  /**
   * Checks if this timestamp is after another
   */
  isAfter(other: EventTimestamp): boolean {
    return this._value.getTime() > other._value.getTime();
  }

  /**
   * Returns ISO string representation
   */
  toISOString(): string {
    return this._value.toISOString();
  }

  /**
   * Returns locale string representation
   */
  toLocaleString(locale: string): string {
    return this._value.toLocaleString(locale);
  }

  /**
   * Returns the string representation (ISO format)
   */
  toString(): string {
    return this.toISOString();
  }
}
