using TaskManager.Api.Modules.States.Dtos;

namespace TaskManager.Api.Modules.States.Services;

public interface IStateService
{
    Task<IEnumerable<StateDto>> GetAllAsync(Guid? stateGroupId = null, CancellationToken ct = default);
    Task<StateDto> CreateAsync(CreateStateDto dto, CancellationToken ct = default);
    Task<StateDto> UpdateAsync(Guid stateId, UpdateStateDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid stateId, CancellationToken ct = default);
}
