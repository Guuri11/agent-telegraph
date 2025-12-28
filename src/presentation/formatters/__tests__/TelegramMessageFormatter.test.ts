import { TelegramMessageFormatter } from '../TelegramMessageFormatter';
import { AgentEvent } from '../../../domain/entities/AgentEvent';
import { AgentName } from '../../../domain/value-objects/AgentName';
import { EventMetadata } from '../../../domain/value-objects/EventMetadata';
import { EventTimestamp } from '../../../domain/value-objects/EventTimestamp';

describe('TelegramMessageFormatter', () => {
  let formatter: TelegramMessageFormatter;

  beforeEach(() => {
    formatter = new TelegramMessageFormatter();
  });

  describe('format', () => {
    it('should format agent started event', () => {
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.create({ taskDescription: 'Implement feature' })
      );

      const message = formatter.format(event);

      expect(message).toContain('🚀');
      expect(message).toContain('Agent Started');
      expect(message).toContain('Claude Code');
      expect(message).toContain('Implement feature');
    });

    it('should format agent stopped event with duration', () => {
      const event = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.create({
          taskDescription: 'Task completed',
          duration: 65000 // 1 minute and 5 seconds
        })
      );

      const message = formatter.format(event);

      expect(message).toContain('✅');
      expect(message).toContain('Agent Finished');
      expect(message).toContain('1m 5s');
    });

    it('should format waiting for input event', () => {
      const event = AgentEvent.waitingForInput(
        AgentName.create('Claude Code'),
        EventMetadata.create({ message: 'Waiting for user response' })
      );

      const message = formatter.format(event);

      expect(message).toContain('⏸️');
      expect(message).toContain('Waiting for Input');
      expect(message).toContain('Waiting for user response');
    });

    it('should format tool used event', () => {
      const event = AgentEvent.toolUsed(
        AgentName.create('Claude Code'),
        EventMetadata.create({ toolName: 'npm' })
      );

      const message = formatter.format(event);

      expect(message).toContain('🔧');
      expect(message).toContain('Tool Used');
      expect(message).toContain('npm');
    });

    it('should format error occurred event', () => {
      const event = AgentEvent.errorOccurred(
        AgentName.create('Claude Code'),
        EventMetadata.create({ error: 'Connection failed' })
      );

      const message = formatter.format(event);

      expect(message).toContain('❌');
      expect(message).toContain('Error Occurred');
      expect(message).toContain('Connection failed');
    });

    it('should include timestamp in es-ES format', () => {
      const timestamp = EventTimestamp.fromDate(new Date('2024-01-15T10:30:00Z'));
      const event = AgentEvent.create({
        agentName: AgentName.create('Claude Code'),
        eventType: AgentEvent.agentStarted(
          AgentName.create('test'),
          EventMetadata.empty()
        ).eventType,
        timestamp,
        metadata: EventMetadata.empty()
      });

      const message = formatter.format(event);

      expect(message).toContain(timestamp.toLocaleString('es-ES'));
    });

    it('should handle event without metadata gracefully', () => {
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      const message = formatter.format(event);

      expect(message).toContain('Agent Started');
      expect(message).toContain('Claude Code');
      expect(message).not.toContain('undefined');
    });

    it('should format project path when present', () => {
      const event = AgentEvent.waitingForInput(
        AgentName.create('Claude Code'),
        EventMetadata.create({
          projectPath: '/home/user/project',
          message: 'Waiting'
        })
      );

      const message = formatter.format(event);

      expect(message).toContain('/home/user/project');
      expect(message).toContain('Project:');
    });

    it('should truncate long lastOutput to 500 characters', () => {
      const longOutput = 'A'.repeat(1000);
      const event = AgentEvent.waitingForInput(
        AgentName.create('Claude Code'),
        EventMetadata.create({
          lastOutput: longOutput,
          message: 'Waiting'
        })
      );

      const message = formatter.format(event);

      expect(message).toContain('A'.repeat(500));
      expect(message).toContain('...');
      expect(message).not.toContain('A'.repeat(501));
    });

    it('should use markdown formatting', () => {
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.create({ taskDescription: 'Task' })
      );

      const message = formatter.format(event);

      expect(message).toContain('*Agent Started*');
      expect(message).toContain('*Agent:*');
      expect(message).toContain('*Task:*');
    });
  });

  describe('formatDuration', () => {
    it('should format duration in seconds only', () => {
      const duration = 45000; // 45 seconds
      const event = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.create({ duration })
      );

      const message = formatter.format(event);

      expect(message).toContain('45s');
    });

    it('should format duration in minutes and seconds', () => {
      const duration = 125000; // 2 minutes 5 seconds
      const event = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.create({ duration })
      );

      const message = formatter.format(event);

      expect(message).toContain('2m 5s');
    });

    it('should format duration in hours, minutes and seconds', () => {
      const duration = 3665000; // 1 hour 1 minute 5 seconds
      const event = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.create({ duration })
      );

      const message = formatter.format(event);

      expect(message).toContain('1h 1m 5s');
    });
  });
});
