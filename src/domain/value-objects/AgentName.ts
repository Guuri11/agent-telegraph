/**
 * AgentName Value Object
 * Represents the name of an AI agent with validation and immutability
 */
export class AgentName {
  private readonly _value: string;
  private static readonly MAX_LENGTH = 100;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  /**
   * Creates a new AgentName instance
   * @throws Error if the name is invalid
   */
  static create(value: string): AgentName {
    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
      throw new Error('Agent name cannot be empty');
    }

    if (trimmedValue.length > AgentName.MAX_LENGTH) {
      throw new Error(`Agent name cannot exceed ${AgentName.MAX_LENGTH} characters`);
    }

    return new AgentName(trimmedValue);
  }

  get value(): string {
    return this._value;
  }

  /**
   * Checks equality with another AgentName
   */
  equals(other: AgentName): boolean {
    if (!(other instanceof AgentName)) {
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
