/**
 * EventMetadata Value Object
 * Represents optional metadata for an agent event with validation
 */
export interface EventMetadataProps {
  taskDescription?: string;
  duration?: number;
  toolName?: string;
  error?: string;
  message?: string;
  notificationType?: string;
  title?: string;
  projectPath?: string;
  lastOutput?: string;
}

export class EventMetadata {
  private readonly _taskDescription?: string;
  private readonly _duration?: number;
  private readonly _toolName?: string;
  private readonly _error?: string;
  private readonly _message?: string;
  private readonly _notificationType?: string;
  private readonly _title?: string;
  private readonly _projectPath?: string;
  private readonly _lastOutput?: string;

  private static readonly MAX_TASK_DESCRIPTION_LENGTH = 1000;
  private static readonly MAX_MESSAGE_LENGTH = 1000;
  private static readonly MAX_OUTPUT_LENGTH = 5000;

  private constructor(props: EventMetadataProps) {
    this._taskDescription = props.taskDescription;
    this._duration = props.duration;
    this._toolName = props.toolName;
    this._error = props.error;
    this._message = props.message;
    this._notificationType = props.notificationType;
    this._title = props.title;
    this._projectPath = props.projectPath;
    this._lastOutput = props.lastOutput;
    Object.freeze(this);
  }

  /**
   * Creates empty metadata
   */
  static empty(): EventMetadata {
    return new EventMetadata({});
  }

  /**
   * Creates metadata with validation
   * @throws Error if any field is invalid
   */
  static create(props: EventMetadataProps): EventMetadata {
    const validatedProps: EventMetadataProps = {};

    // Validate and normalize task description
    if (props.taskDescription !== undefined) {
      const trimmed = props.taskDescription.trim();
      if (trimmed.length > 0) {
        if (trimmed.length > EventMetadata.MAX_TASK_DESCRIPTION_LENGTH) {
          throw new Error(`Task description cannot exceed ${EventMetadata.MAX_TASK_DESCRIPTION_LENGTH} characters`);
        }
        validatedProps.taskDescription = trimmed;
      }
    }

    // Validate duration
    if (props.duration !== undefined) {
      if (props.duration < 0) {
        throw new Error('Duration cannot be negative');
      }
      validatedProps.duration = props.duration;
    }

    // Validate and normalize tool name
    if (props.toolName !== undefined) {
      const trimmed = props.toolName.trim();
      if (trimmed.length > 0) {
        validatedProps.toolName = trimmed;
      }
    }

    // Validate and normalize error
    if (props.error !== undefined) {
      const trimmed = props.error.trim();
      if (trimmed.length > 0) {
        validatedProps.error = trimmed;
      }
    }

    // Validate and normalize message
    if (props.message !== undefined) {
      const trimmed = props.message.trim();
      if (trimmed.length > 0) {
        if (trimmed.length > EventMetadata.MAX_MESSAGE_LENGTH) {
          throw new Error(`Message cannot exceed ${EventMetadata.MAX_MESSAGE_LENGTH} characters`);
        }
        validatedProps.message = trimmed;
      }
    }

    // Validate and normalize notification type
    if (props.notificationType !== undefined) {
      const trimmed = props.notificationType.trim();
      if (trimmed.length > 0) {
        validatedProps.notificationType = trimmed;
      }
    }

    // Validate and normalize title
    if (props.title !== undefined) {
      const trimmed = props.title.trim();
      if (trimmed.length > 0) {
        validatedProps.title = trimmed;
      }
    }

    // Validate and normalize project path
    if (props.projectPath !== undefined) {
      const trimmed = props.projectPath.trim();
      if (trimmed.length > 0) {
        validatedProps.projectPath = trimmed;
      }
    }

    // Validate and normalize last output
    if (props.lastOutput !== undefined) {
      const trimmed = props.lastOutput.trim();
      if (trimmed.length > 0) {
        if (trimmed.length > EventMetadata.MAX_OUTPUT_LENGTH) {
          throw new Error(`Last output cannot exceed ${EventMetadata.MAX_OUTPUT_LENGTH} characters`);
        }
        validatedProps.lastOutput = trimmed;
      }
    }

    return new EventMetadata(validatedProps);
  }

  get taskDescription(): string | undefined {
    return this._taskDescription;
  }

  get duration(): number | undefined {
    return this._duration;
  }

  get toolName(): string | undefined {
    return this._toolName;
  }

  get error(): string | undefined {
    return this._error;
  }

  get message(): string | undefined {
    return this._message;
  }

  get notificationType(): string | undefined {
    return this._notificationType;
  }

  get title(): string | undefined {
    return this._title;
  }

  get projectPath(): string | undefined {
    return this._projectPath;
  }

  get lastOutput(): string | undefined {
    return this._lastOutput;
  }

  /**
   * Checks if metadata is empty (no fields set)
   */
  isEmpty(): boolean {
    return this._taskDescription === undefined &&
      this._duration === undefined &&
      this._toolName === undefined &&
      this._error === undefined &&
      this._message === undefined &&
      this._notificationType === undefined &&
      this._title === undefined &&
      this._projectPath === undefined &&
      this._lastOutput === undefined;
  }

  /**
   * Checks if task description is set
   */
  hasTaskDescription(): boolean {
    return this._taskDescription !== undefined;
  }

  /**
   * Checks if duration is set
   */
  hasDuration(): boolean {
    return this._duration !== undefined;
  }

  /**
   * Checks equality with another EventMetadata
   */
  equals(other: EventMetadata): boolean {
    if (!(other instanceof EventMetadata)) {
      return false;
    }
    return this._taskDescription === other._taskDescription &&
      this._duration === other._duration &&
      this._toolName === other._toolName &&
      this._error === other._error &&
      this._message === other._message &&
      this._notificationType === other._notificationType &&
      this._title === other._title &&
      this._projectPath === other._projectPath &&
      this._lastOutput === other._lastOutput;
  }

  /**
   * Converts to a plain object (for serialization)
   */
  toJSON(): EventMetadataProps {
    const json: EventMetadataProps = {};

    if (this._taskDescription !== undefined) json.taskDescription = this._taskDescription;
    if (this._duration !== undefined) json.duration = this._duration;
    if (this._toolName !== undefined) json.toolName = this._toolName;
    if (this._error !== undefined) json.error = this._error;
    if (this._message !== undefined) json.message = this._message;
    if (this._notificationType !== undefined) json.notificationType = this._notificationType;
    if (this._title !== undefined) json.title = this._title;
    if (this._projectPath !== undefined) json.projectPath = this._projectPath;
    if (this._lastOutput !== undefined) json.lastOutput = this._lastOutput;

    return json;
  }
}
