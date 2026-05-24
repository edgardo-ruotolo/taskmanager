namespace TaskManager.Api.Modules.Realtime.Contracts;

public sealed record RealtimeEvent(
    string Type,
    string WorkspaceSlug,
    Guid ProjectId,
    Guid? EntityId,
    Guid ActorId,
    DateTimeOffset At);
