/**
 * EventNotifier Port
 * Interface for sending event notifications
 * Implementations belong to the Infrastructure layer
 */
export interface EventNotifier {
  /**
   * Sends a notification with the given message
   */
  notify(message: string): Promise<void>;
}
