using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Teams.Dtos;
using TaskManager.Api.Modules.Teams.Entities;

namespace TaskManager.Api.Modules.Teams.Services;

public class TeamService(AppDbContext db) : ITeamService
{
    private const int MaxPageSize = 100;

    public async Task<PagedResult<TeamDto>> GetAllAsync(string workspaceSlug, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null)
            return new PagedResult<TeamDto> { Items = [], TotalCount = 0, Page = page, PageSize = pageSize };

        var query = db.Teams
            .AsNoTracking()
            .Include(t => t.Members)
            .Where(t => t.WorkspaceId == workspace.Id);

        var total = await query.CountAsync(ct);

        var teams = await query
            .OrderBy(t => t.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<TeamDto>
        {
            Items = teams.Select(MapToDto),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<TeamDto?> GetByIdAsync(Guid teamId, CancellationToken ct = default)
    {
        var team = await db.Teams
            .AsNoTracking()
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == teamId, ct);
        return team is null ? null : MapToDto(team);
    }

    public async Task<TeamDto?> CreateAsync(string workspaceSlug, Guid creatorId, CreateTeamDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return null;

        var team = new Team
        {
            Name = dto.Name,
            Description = dto.Description,
            Identifier = dto.Identifier,
            WorkspaceId = workspace.Id,
            CreatedById = creatorId
        };

        db.Teams.Add(team);
        await db.SaveChangesAsync(ct);
        return MapToDto(team);
    }

    public async Task<TeamDto?> UpdateAsync(Guid teamId, UpdateTeamDto dto, CancellationToken ct = default)
    {
        var team = await db.Teams
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == teamId, ct);
        if (team is null) return null;

        if (dto.Name is not null) team.Name = dto.Name;
        if (dto.Description is not null) team.Description = dto.Description;
        if (dto.Identifier is not null) team.Identifier = dto.Identifier;
        if (dto.LogoUrl is not null) team.LogoUrl = dto.LogoUrl;

        await db.SaveChangesAsync(ct);
        return MapToDto(team);
    }

    public async Task<bool> DeleteAsync(Guid teamId, CancellationToken ct = default)
    {
        var team = await db.Teams.FirstOrDefaultAsync(t => t.Id == teamId, ct);
        if (team is null) return false;
        team.IsDeleted = true;
        team.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<TeamMemberDto>> GetMembersAsync(Guid teamId, CancellationToken ct = default)
    {
        var members = await db.TeamMembers
            .AsNoTracking()
            .Include(m => m.User)
            .Where(m => m.TeamId == teamId)
            .ToListAsync(ct);

        return members.Select(MapMemberToDto).ToList();
    }

    public async Task<bool> AddMemberAsync(Guid teamId, Guid userId, CancellationToken ct = default)
    {
        if (await db.TeamMembers.AnyAsync(m => m.TeamId == teamId && m.UserId == userId, ct))
            return false;

        db.TeamMembers.Add(new TeamMember { TeamId = teamId, UserId = userId });
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> RemoveMemberAsync(Guid teamId, Guid userId, CancellationToken ct = default)
    {
        var member = await db.TeamMembers.FirstOrDefaultAsync(m => m.TeamId == teamId && m.UserId == userId, ct);
        if (member is null) return false;
        member.IsDeleted = true;
        member.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }

    private static TeamDto MapToDto(Team t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        Description = t.Description,
        Identifier = t.Identifier,
        LogoUrl = t.LogoUrl,
        WorkspaceId = t.WorkspaceId,
        CreatedById = t.CreatedById,
        MemberCount = t.Members.Count,
        CreatedAt = t.CreatedAt
    };

    private static TeamMemberDto MapMemberToDto(TeamMember m) => new()
    {
        Id = m.Id,
        TeamId = m.TeamId,
        UserId = m.UserId,
        UserName = m.User?.UserName ?? "",
        UserEmail = m.User?.Email ?? "",
        Role = m.Role
    };
}
