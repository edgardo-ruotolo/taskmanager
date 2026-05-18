using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueService
{
    Task<IssueDto> CreateAsync(string workspaceSlug, Guid companyId, Guid userId, CreateIssueDto dto, CancellationToken ct = default);
    Task<PagedResult<IssueDto>> GetAllAsync(string workspaceSlug, Guid companyId, int page, int pageSize, CancellationToken ct = default);
    Task<IssueDto> GetByIdAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default);
    Task<IssueDto> UpdateAsync(string workspaceSlug, Guid companyId, Guid issueId, UpdateIssueDto dto, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default);
    Task AddAssigneeAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task RemoveAssigneeAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task AddLabelAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid labelId, CancellationToken ct = default);
    Task RemoveLabelAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid labelId, CancellationToken ct = default);
    Task<List<IssueDto>> GetArchivedAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default);
    Task ArchiveAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default);
    Task UnarchiveAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default);
    Task BulkArchiveAsync(string workspaceSlug, Guid companyId, List<Guid> issueIds, CancellationToken ct = default);
    Task BulkDeleteAsync(string workspaceSlug, Guid companyId, List<Guid> issueIds, CancellationToken ct = default);
    Task BulkUpdateAsync(string workspaceSlug, Guid companyId, List<Guid> issueIds, BulkUpdateIssueDto dto, CancellationToken ct = default);
}
