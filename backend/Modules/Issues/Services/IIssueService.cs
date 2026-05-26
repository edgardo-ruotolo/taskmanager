using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueService
{
    Task<IssueDto> CreateAsync(string workspaceSlug, Guid projectId, Guid userId, CreateIssueDto dto, CancellationToken ct = default);
    Task<PagedResult<IssueDto>> GetAllAsync(
        string workspaceSlug,
        Guid projectId,
        int page,
        int pageSize,
        Guid? parentId = null,
        bool? topLevelOnly = null,
        CancellationToken ct = default);
    Task<IssueDto> GetByIdAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default);
    Task<IssueDto> UpdateAsync(string workspaceSlug, Guid projectId, Guid issueId, UpdateIssueDto dto, Guid currentUserId, CancellationToken ct = default);
    Task<IssueDto> ApproveAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid targetStateId, Guid currentUserId, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default);
    Task AddAssigneeAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task RemoveAssigneeAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task AddLabelAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid labelId, CancellationToken ct = default);
    Task RemoveLabelAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid labelId, CancellationToken ct = default);
    Task<List<IssueDto>> SearchSimilarAsync(string workspaceSlug, Guid projectId, string title, double threshold = 0.3, CancellationToken ct = default);
    Task AttachCycleAsync(Guid projectId, Guid issueId, Guid cycleId, Guid userId, CancellationToken ct = default);
    Task DetachCycleAsync(Guid projectId, Guid issueId, CancellationToken ct = default);
    Task AttachModulesAsync(Guid projectId, Guid issueId, List<Guid> moduleIds, Guid userId, CancellationToken ct = default);
    Task DetachModuleAsync(Guid projectId, Guid issueId, Guid moduleId, CancellationToken ct = default);
}
