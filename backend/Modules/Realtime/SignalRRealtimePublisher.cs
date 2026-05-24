using Microsoft.AspNetCore.SignalR;
using TaskManager.Api.Hubs;
using TaskManager.Api.Modules.Realtime.Contracts;

namespace TaskManager.Api.Modules.Realtime;

internal sealed class SignalRRealtimePublisher(
    IHubContext<IssueHub> hub,
    ILogger<SignalRRealtimePublisher> log) : IRealtimePublisher
{
    public async Task PublishToProjectAsync(Guid projectId, RealtimeEvent evt, CancellationToken ct = default)
    {
        try
        {
            log.LogDebug("Realtime -> project:{ProjectId} type={Type} actor={ActorId}", projectId, evt.Type, evt.ActorId);
            await hub.Clients.Group($"project:{projectId}").SendAsync("RealtimeEvent", evt, ct);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Realtime publish to project:{ProjectId} failed", projectId);
        }
    }

    public async Task PublishToIssueAsync(Guid issueId, RealtimeEvent evt, CancellationToken ct = default)
    {
        try
        {
            log.LogDebug("Realtime -> issue:{IssueId} type={Type} actor={ActorId}", issueId, evt.Type, evt.ActorId);
            await hub.Clients.Group($"issue:{issueId}").SendAsync("RealtimeEvent", evt, ct);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Realtime publish to issue:{IssueId} failed", issueId);
        }
    }
}
