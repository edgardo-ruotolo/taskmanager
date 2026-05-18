using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Workspaces.Dtos;

namespace TaskManager.Api.Modules.Workspaces.Services;

public interface IWorkspaceService
{
    Task<WorkspaceDto> CreateAsync(Guid userId, CreateWorkspaceDto dto, CancellationToken ct = default);
    Task<PagedResult<WorkspaceDto>> GetUserWorkspacesAsync(Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task<WorkspaceDto> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task DeleteAsync(string slug, Guid userId, CancellationToken ct = default);
    Task<WorkspaceDto> UpdateAsync(string slug, Guid userId, UpdateWorkspaceDto dto, CancellationToken ct = default);

    // Members
    Task<IEnumerable<WorkspaceMemberDto>> GetMembersAsync(string slug, CancellationToken ct = default);
    Task RemoveMemberAsync(string slug, Guid userId, Guid requesterId, CancellationToken ct = default);
    Task<WorkspaceMemberDto> UpdateMemberRoleAsync(string slug, Guid userId, UpdateMemberRoleDto dto, Guid requesterId, CancellationToken ct = default);

    // Invitations
    Task<WorkspaceInvitationDto> InviteMemberAsync(string slug, CreateWorkspaceInvitationDto dto, Guid invitedById, CancellationToken ct = default);
    Task AcceptInvitationAsync(string token, Guid userId, CancellationToken ct = default);
    Task<IEnumerable<WorkspaceInvitationDto>> GetPendingInvitationsAsync(string slug, CancellationToken ct = default);
    Task RevokeInvitationAsync(Guid invitationId, Guid requesterId, CancellationToken ct = default);
}
