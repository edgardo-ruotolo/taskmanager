using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Workspaces.Dtos;

namespace TaskManager.Api.Modules.Workspaces.Services;

public interface IWorkspaceActivityService
{
    Task<PagedResult<WorkspaceActivityDto>> GetAllAsync(string workspaceSlug, int page, int pageSize, CancellationToken ct = default);
    Task LogAsync(Guid workspaceId, Guid actorId, string action, string? entityType, Guid? entityId, string? entityTitle, CancellationToken ct = default);
}
