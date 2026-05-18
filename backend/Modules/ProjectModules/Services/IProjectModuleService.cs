using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.ProjectModules.Dtos;

namespace TaskManager.Api.Modules.ProjectModules.Services;

public interface IProjectModuleService
{
    Task<PagedResult<ProjectModuleDto>> GetAllAsync(string workspaceSlug, Guid companyId, int page, int pageSize, CancellationToken ct = default);
    Task<ProjectModuleDto> GetByIdAsync(string workspaceSlug, Guid companyId, Guid moduleId, CancellationToken ct = default);
    Task<ProjectModuleDto> CreateAsync(string workspaceSlug, Guid companyId, Guid userId, CreateProjectModuleDto dto, CancellationToken ct = default);
    Task<ProjectModuleDto> UpdateAsync(string workspaceSlug, Guid companyId, Guid moduleId, UpdateProjectModuleDto dto, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid companyId, Guid moduleId, CancellationToken ct = default);
    Task AddIssueAsync(string workspaceSlug, Guid companyId, Guid moduleId, Guid issueId, Guid userId, CancellationToken ct = default);
    Task RemoveIssueAsync(string workspaceSlug, Guid companyId, Guid moduleId, Guid issueId, CancellationToken ct = default);
    Task AddLinkAsync(string workspaceSlug, Guid companyId, Guid moduleId, AddModuleLinkDto dto, Guid userId, CancellationToken ct = default);
    Task RemoveLinkAsync(string workspaceSlug, Guid companyId, Guid moduleId, Guid linkId, CancellationToken ct = default);
    Task AddMemberAsync(string workspaceSlug, Guid companyId, Guid moduleId, Guid memberId, CancellationToken ct = default);
    Task RemoveMemberAsync(string workspaceSlug, Guid companyId, Guid moduleId, Guid memberId, CancellationToken ct = default);
    Task<List<ProjectModuleDto>> GetArchivedAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default);
    Task ArchiveAsync(string workspaceSlug, Guid companyId, Guid moduleId, CancellationToken ct = default);
    Task UnarchiveAsync(string workspaceSlug, Guid companyId, Guid moduleId, CancellationToken ct = default);
}
