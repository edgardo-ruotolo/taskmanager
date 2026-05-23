using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Cycles.Dtos;

namespace TaskManager.Api.Modules.Cycles.Services;

public interface ICycleService
{
    Task<PagedResult<CycleDto>> GetAllAsync(string workspaceSlug, Guid projectId, int page, int pageSize, CancellationToken ct = default);
    Task<CycleDto> GetByIdAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default);
    Task<CycleDto> CreateAsync(string workspaceSlug, Guid projectId, Guid userId, CreateCycleDto dto, CancellationToken ct = default);
    Task<CycleDto> UpdateAsync(string workspaceSlug, Guid projectId, Guid cycleId, UpdateCycleDto dto, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default);
    Task AddIssueAsync(string workspaceSlug, Guid projectId, Guid cycleId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task RemoveIssueAsync(string workspaceSlug, Guid projectId, Guid cycleId, Guid issueId, CancellationToken ct = default);
    Task<List<CycleDto>> GetArchivedAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default);
    Task ArchiveAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default);
    Task UnarchiveAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default);
    Task TransferIssuesAsync(string workspaceSlug, Guid projectId, Guid sourceCycleId, Guid targetCycleId, CancellationToken ct = default);
    Task<CycleProgressDto> GetProgressAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default);
    Task<CycleAnalyticsDto> GetAnalyticsAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default);
}
