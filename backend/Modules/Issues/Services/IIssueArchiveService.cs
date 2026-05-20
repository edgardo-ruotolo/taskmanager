using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueArchiveService
{
    Task<IReadOnlyList<IssueDto>> GetArchivedAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default);
    Task ArchiveAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default);
    Task UnarchiveAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default);
    Task BulkArchiveAsync(string workspaceSlug, Guid companyId, List<Guid> issueIds, CancellationToken ct = default);
    Task BulkDeleteAsync(string workspaceSlug, Guid companyId, List<Guid> issueIds, CancellationToken ct = default);
    Task BulkUpdateAsync(string workspaceSlug, Guid companyId, List<Guid> issueIds, BulkUpdateIssueDto dto, Guid currentUserId, CancellationToken ct = default);
    Task<IssueDto> DuplicateAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid currentUserId, CancellationToken ct = default);
}
