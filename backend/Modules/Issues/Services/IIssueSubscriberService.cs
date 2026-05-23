using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueSubscriberService
{
    Task<List<IssueSubscriberDto>> GetSubscribersAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default);
    Task SubscribeAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task UnsubscribeAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid userId, CancellationToken ct = default);
}
