using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Teams.Dtos;

namespace TaskManager.Api.Modules.Teams.Services;

public interface ITeamService
{
    Task<PagedResult<TeamDto>> GetAllAsync(string workspaceSlug, int page, int pageSize, CancellationToken ct = default);
    Task<TeamDto?> GetByIdAsync(Guid teamId, CancellationToken ct = default);
    Task<TeamDto?> CreateAsync(string workspaceSlug, Guid creatorId, CreateTeamDto dto, CancellationToken ct = default);
    Task<TeamDto?> UpdateAsync(Guid teamId, UpdateTeamDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid teamId, CancellationToken ct = default);
    Task<IReadOnlyList<TeamMemberDto>> GetMembersAsync(Guid teamId, CancellationToken ct = default);
    /// <summary>Returns false when the user is already a member; true when added.</summary>
    Task<bool> AddMemberAsync(Guid teamId, Guid userId, CancellationToken ct = default);
    Task<bool> RemoveMemberAsync(Guid teamId, Guid userId, CancellationToken ct = default);
}
