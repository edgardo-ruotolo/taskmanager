using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueArchiveService
{
    Task<IReadOnlyList<IssueDto>> GetArchivedAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default);
    Task ArchiveAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default);
    Task UnarchiveAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default);
    Task BulkArchiveAsync(string workspaceSlug, Guid projectId, List<Guid> issueIds, CancellationToken ct = default);
    Task BulkDeleteAsync(string workspaceSlug, Guid projectId, List<Guid> issueIds, CancellationToken ct = default);
    Task BulkUpdateAsync(string workspaceSlug, Guid projectId, List<Guid> issueIds, BulkUpdateIssueDto dto, Guid currentUserId, CancellationToken ct = default);
    Task<IssueDto> DuplicateAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid currentUserId, CancellationToken ct = default);
}
