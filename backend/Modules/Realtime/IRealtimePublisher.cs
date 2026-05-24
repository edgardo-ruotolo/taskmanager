using TaskManager.Api.Modules.Realtime.Contracts;

namespace TaskManager.Api.Modules.Realtime;

public interface IRealtimePublisher
{
    Task PublishToProjectAsync(Guid projectId, RealtimeEvent evt, CancellationToken ct = default);
    Task PublishToIssueAsync(Guid issueId, RealtimeEvent evt, CancellationToken ct = default);
}
