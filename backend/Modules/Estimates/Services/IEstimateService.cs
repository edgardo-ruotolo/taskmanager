using TaskManager.Api.Modules.Estimates.Dtos;

namespace TaskManager.Api.Modules.Estimates.Services;

public interface IEstimateService
{
    Task<List<EstimateDto>> GetAllAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default);
    Task<EstimateDto> GetByIdAsync(string workspaceSlug, Guid projectId, Guid estimateId, CancellationToken ct = default);
    Task<EstimateDto> CreateAsync(string workspaceSlug, Guid projectId, CreateEstimateDto dto, CancellationToken ct = default);
    Task<EstimateDto> UpdateAsync(string workspaceSlug, Guid projectId, Guid estimateId, UpdateEstimateDto dto, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid projectId, Guid estimateId, CancellationToken ct = default);
    Task<EstimatePointDto> AddPointAsync(string workspaceSlug, Guid projectId, Guid estimateId, CreateEstimatePointDto dto, CancellationToken ct = default);
    Task DeletePointAsync(string workspaceSlug, Guid projectId, Guid estimateId, Guid pointId, CancellationToken ct = default);
}
