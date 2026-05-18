using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Cycles.Dtos;

namespace TaskManager.Api.Modules.Cycles.Services;

public interface ICycleService
{
    Task<PagedResult<CycleDto>> GetAllAsync(string workspaceSlug, Guid companyId, int page, int pageSize, CancellationToken ct = default);
    Task<CycleDto> GetByIdAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default);
    Task<CycleDto> CreateAsync(string workspaceSlug, Guid companyId, Guid userId, CreateCycleDto dto, CancellationToken ct = default);
    Task<CycleDto> UpdateAsync(string workspaceSlug, Guid companyId, Guid cycleId, UpdateCycleDto dto, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default);
    Task AddIssueAsync(string workspaceSlug, Guid companyId, Guid cycleId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task RemoveIssueAsync(string workspaceSlug, Guid companyId, Guid cycleId, Guid issueId, CancellationToken ct = default);
    Task<List<CycleDto>> GetArchivedAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default);
    Task ArchiveAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default);
    Task UnarchiveAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default);
    Task TransferIssuesAsync(string workspaceSlug, Guid companyId, Guid sourceCycleId, Guid targetCycleId, CancellationToken ct = default);
    Task<CycleProgressDto> GetProgressAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default);
    Task<CycleAnalyticsDto> GetAnalyticsAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default);
}
