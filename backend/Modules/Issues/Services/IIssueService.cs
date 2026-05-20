using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueService
{
    Task<IssueDto> CreateAsync(string workspaceSlug, Guid companyId, Guid userId, CreateIssueDto dto, CancellationToken ct = default);
    Task<PagedResult<IssueDto>> GetAllAsync(string workspaceSlug, Guid companyId, int page, int pageSize, CancellationToken ct = default);
    Task<IssueDto> GetByIdAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default);
    Task<IssueDto> UpdateAsync(string workspaceSlug, Guid companyId, Guid issueId, UpdateIssueDto dto, Guid currentUserId, CancellationToken ct = default);
    Task<IssueDto> ApproveAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid targetStateId, Guid currentUserId, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default);
    Task AddAssigneeAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task RemoveAssigneeAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task AddLabelAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid labelId, CancellationToken ct = default);
    Task RemoveLabelAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid labelId, CancellationToken ct = default);
    Task<List<IssueDto>> SearchSimilarAsync(string workspaceSlug, Guid companyId, string title, double threshold = 0.3, CancellationToken ct = default);
    Task AttachCycleAsync(Guid companyId, Guid issueId, Guid cycleId, Guid userId, CancellationToken ct = default);
    Task DetachCycleAsync(Guid companyId, Guid issueId, CancellationToken ct = default);
    Task AttachModulesAsync(Guid companyId, Guid issueId, List<Guid> moduleIds, Guid userId, CancellationToken ct = default);
    Task DetachModuleAsync(Guid companyId, Guid issueId, Guid moduleId, CancellationToken ct = default);
}
