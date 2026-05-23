using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Projects.Dtos;

namespace TaskManager.Api.Modules.Projects.Services;

public interface IProjectService
{
    Task<ProjectDto> CreateAsync(string workspaceSlug, Guid userId, CreateProjectDto dto, CancellationToken ct = default);
    Task<PagedResult<ProjectDto>> GetAllAsync(string workspaceSlug, int page, int pageSize, CancellationToken ct = default);
    Task<ProjectDto> GetByIdAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default);
    Task DeleteAsync(string workspaceSlug, Guid projectId, Guid userId, CancellationToken ct = default);
    Task<ProjectDto> UpdateAsync(string workspaceSlug, Guid projectId, Guid userId, UpdateProjectDto dto, CancellationToken ct = default);
    Task<ProjectDto> UpdateTeamAsync(string workspaceSlug, Guid projectId, Guid userId, UpdateProjectTeamDto dto, CancellationToken ct = default);

    // Members
    Task<IEnumerable<ProjectMemberDto>> GetMembersAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default);
    Task<ProjectMemberDto> AddMemberAsync(string workspaceSlug, Guid projectId, AddProjectMemberDto dto, Guid requesterId, CancellationToken ct = default);
    Task RemoveMemberAsync(string workspaceSlug, Guid projectId, Guid userId, Guid requesterId, CancellationToken ct = default);
    Task<ProjectMemberDto> UpdateMemberRoleAsync(string workspaceSlug, Guid projectId, Guid userId, UpdateProjectMemberRoleDto dto, Guid requesterId, CancellationToken ct = default);

    // Invitations
    Task<ProjectInvitationDto> InviteMemberAsync(string workspaceSlug, Guid projectId, CreateProjectInvitationDto dto, Guid invitedById, CancellationToken ct = default);
    Task AcceptInvitationAsync(string token, Guid userId, CancellationToken ct = default);
    Task<IEnumerable<ProjectInvitationDto>> GetPendingInvitationsAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default);
    Task RevokeInvitationAsync(Guid invitationId, Guid requesterId, CancellationToken ct = default);
}
