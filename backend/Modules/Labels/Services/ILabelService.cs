using TaskManager.Api.Modules.Labels.Dtos;

namespace TaskManager.Api.Modules.Labels.Services;

public interface ILabelService
{
    Task<IEnumerable<LabelDto>> GetAllAsync(string workspaceSlug, CancellationToken ct = default);
    Task<LabelDto> GetByIdAsync(string workspaceSlug, Guid labelId, CancellationToken ct = default);
    Task<LabelDto> CreateAsync(string workspaceSlug, CreateLabelDto dto, CancellationToken ct = default);
    Task<LabelDto> UpdateAsync(string workspaceSlug, Guid labelId, UpdateLabelDto dto, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid labelId, CancellationToken ct = default);
}
