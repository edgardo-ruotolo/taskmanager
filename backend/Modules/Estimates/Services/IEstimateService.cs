using TaskManager.Api.Modules.Estimates.Dtos;

namespace TaskManager.Api.Modules.Estimates.Services;

public interface IEstimateService
{
    Task<List<EstimateDto>> GetAllAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default);
    Task<EstimateDto> GetByIdAsync(string workspaceSlug, Guid companyId, Guid estimateId, CancellationToken ct = default);
    Task<EstimateDto> CreateAsync(string workspaceSlug, Guid companyId, CreateEstimateDto dto, CancellationToken ct = default);
    Task<EstimateDto> UpdateAsync(string workspaceSlug, Guid companyId, Guid estimateId, UpdateEstimateDto dto, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid companyId, Guid estimateId, CancellationToken ct = default);
    Task<EstimatePointDto> AddPointAsync(string workspaceSlug, Guid companyId, Guid estimateId, CreateEstimatePointDto dto, CancellationToken ct = default);
    Task DeletePointAsync(string workspaceSlug, Guid companyId, Guid estimateId, Guid pointId, CancellationToken ct = default);
}
