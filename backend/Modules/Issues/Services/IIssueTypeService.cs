using TaskManager.Api.Modules.Issues.Dtos;

namespace TaskManager.Api.Modules.Issues.Services;

public interface IIssueTypeService
{
    Task<List<IssueTypeDto>> GetTypesAsync(Guid workspaceId, CancellationToken ct = default);
    Task<IssueTypeDto> CreateTypeAsync(Guid workspaceId, CreateIssueTypeDto dto, CancellationToken ct = default);
    Task DeleteTypeAsync(Guid typeId, CancellationToken ct = default);
}
