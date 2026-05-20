using TaskManager.Api.Modules.Admin.Dtos;

namespace TaskManager.Api.Modules.Admin.Services;

public interface IFeatureFlagService
{
    Task<IReadOnlyList<FeatureFlagDto>> GetAllAsync(CancellationToken ct = default);
    Task<FeatureFlagDto> UpsertAsync(string key, UpdateFeatureFlagDto dto, CancellationToken ct = default);
    Task<bool> IsEnabledAsync(string key, CancellationToken ct = default);
}
