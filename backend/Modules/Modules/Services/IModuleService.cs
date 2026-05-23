using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Modules.Dtos;

namespace TaskManager.Api.Modules.Modules.Services;

public interface IModuleService
{
    Task<PagedResult<ModuleDto>> GetAllAsync(string workspaceSlug, Guid projectId, int page, int pageSize, CancellationToken ct = default);
    Task<ModuleDto> GetByIdAsync(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default);
    Task<ModuleDto> CreateAsync(string workspaceSlug, Guid projectId, Guid userId, CreateModuleDto dto, CancellationToken ct = default);
    Task<ModuleDto> UpdateAsync(string workspaceSlug, Guid projectId, Guid moduleId, UpdateModuleDto dto, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default);
    Task AddIssueAsync(string workspaceSlug, Guid projectId, Guid moduleId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task RemoveIssueAsync(string workspaceSlug, Guid projectId, Guid moduleId, Guid issueId, CancellationToken ct = default);
    Task AddLinkAsync(string workspaceSlug, Guid projectId, Guid moduleId, AddModuleLinkDto dto, Guid userId, CancellationToken ct = default);
    Task RemoveLinkAsync(string workspaceSlug, Guid projectId, Guid moduleId, Guid linkId, CancellationToken ct = default);
    Task AddMemberAsync(string workspaceSlug, Guid projectId, Guid moduleId, Guid memberId, CancellationToken ct = default);
    Task RemoveMemberAsync(string workspaceSlug, Guid projectId, Guid moduleId, Guid memberId, CancellationToken ct = default);
    Task<List<ModuleDto>> GetArchivedAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default);
    Task ArchiveAsync(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default);
    Task UnarchiveAsync(string workspaceSlug, Guid projectId, Guid moduleId, CancellationToken ct = default);
}
