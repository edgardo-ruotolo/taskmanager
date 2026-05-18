using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueSubscriberService
{
    Task<List<IssueSubscriberDto>> GetSubscribersAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default);
    Task SubscribeAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task UnsubscribeAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid userId, CancellationToken ct = default);
}
