using TaskManager.Api.Modules.Admin.Dtos;

namespace TaskManager.Api.Modules.Admin.Services;

public interface IInstanceConfigService
{
    Task<InstanceConfigDto> GetAsync(CancellationToken ct = default);
    Task<InstanceConfigDto> UpdateAsync(UpdateInstanceConfigDto dto, CancellationToken ct = default);
}
