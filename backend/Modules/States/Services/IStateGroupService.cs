using TaskManager.Api.Modules.States.Dtos;

namespace TaskManager.Api.Modules.States.Services;

public interface IStateGroupService
{
    Task<IEnumerable<StateGroupDto>> GetAllAsync(CancellationToken ct = default);
    Task<StateGroupDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<StateGroupDto> CreateAsync(CreateStateGroupDto dto, CancellationToken ct = default);
    Task<StateGroupDto> UpdateAsync(Guid id, UpdateStateGroupDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
