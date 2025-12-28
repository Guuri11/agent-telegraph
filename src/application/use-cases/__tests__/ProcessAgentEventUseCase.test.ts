import { ProcessAgentEventUseCase } from '../ProcessAgentEventUseCase';
import { AgentEvent } from '../../../domain/entities/AgentEvent';
import { AgentName } from '../../../domain/value-objects/AgentName';
import { EventMetadata } from '../../../domain/value-objects/EventMetadata';
import { EventNotifier } from '../../../domain/ports/EventNotifier';
import { TelegramMessageFormatter } from '../../../presentation/formatters/TelegramMessageFormatter';

describe('ProcessAgentEventUseCase', () => {
  let mockNotifier: jest.Mocked<EventNotifier>;
  let formatter: TelegramMessageFormatter;
  let useCase: ProcessAgentEventUseCase;

  beforeEach(() => {
    mockNotifier = {
      notify: jest.fn().mockResolvedValue(undefined)
    };
    formatter = new TelegramMessageFormatter();
    useCase = new ProcessAgentEventUseCase(mockNotifier, formatter);
  });

  describe('execute', () => {
    it('should process and send notification for event', async () => {
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.create({ taskDescription: 'Implement feature' })
      );

      await useCase.execute(event);

      expect(mockNotifier.notify).toHaveBeenCalledTimes(1);
      const sentMessage = mockNotifier.notify.mock.calls[0][0];
      expect(sentMessage).toContain('Agent Started');
      expect(sentMessage).toContain('Claude Code');
      expect(sentMessage).toContain('Implement feature');
    });

    it('should process agent stopped event with duration', async () => {
      const event = AgentEvent.agentStopped(
        AgentName.create('Claude Code'),
        EventMetadata.create({ duration: 5000 })
      );

      await useCase.execute(event);

      expect(mockNotifier.notify).toHaveBeenCalledTimes(1);
      const sentMessage = mockNotifier.notify.mock.calls[0][0];
      expect(sentMessage).toContain('Agent Finished');
      expect(sentMessage).toContain('5s');
    });

    it('should process waiting for input event', async () => {
      const event = AgentEvent.waitingForInput(
        AgentName.create('Claude Code'),
        EventMetadata.create({ message: 'Waiting for user' })
      );

      await useCase.execute(event);

      expect(mockNotifier.notify).toHaveBeenCalledTimes(1);
      const sentMessage = mockNotifier.notify.mock.calls[0][0];
      expect(sentMessage).toContain('Waiting for Input');
      expect(sentMessage).toContain('Waiting for user');
    });

    it('should propagate notifier errors', async () => {
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      mockNotifier.notify.mockRejectedValue(new Error('Network error'));

      await expect(useCase.execute(event)).rejects.toThrow('Network error');
    });

    it('should handle events with empty metadata', async () => {
      const event = AgentEvent.agentStarted(
        AgentName.create('Claude Code'),
        EventMetadata.empty()
      );

      await useCase.execute(event);

      expect(mockNotifier.notify).toHaveBeenCalledTimes(1);
      const sentMessage = mockNotifier.notify.mock.calls[0][0];
      expect(sentMessage).toContain('Agent Started');
      expect(sentMessage).toContain('Claude Code');
    });

    it('should process tool used event', async () => {
      const event = AgentEvent.toolUsed(
        AgentName.create('Claude Code'),
        EventMetadata.create({ toolName: 'npm' })
      );

      await useCase.execute(event);

      expect(mockNotifier.notify).toHaveBeenCalledTimes(1);
      const sentMessage = mockNotifier.notify.mock.calls[0][0];
      expect(sentMessage).toContain('Tool Used');
      expect(sentMessage).toContain('npm');
    });

    it('should process error occurred event', async () => {
      const event = AgentEvent.errorOccurred(
        AgentName.create('Claude Code'),
        EventMetadata.create({ error: 'Connection failed' })
      );

      await useCase.execute(event);

      expect(mockNotifier.notify).toHaveBeenCalledTimes(1);
      const sentMessage = mockNotifier.notify.mock.calls[0][0];
      expect(sentMessage).toContain('Error Occurred');
      expect(sentMessage).toContain('Connection failed');
    });
  });
});
