using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Teams.Dtos;
using TaskManager.Api.Modules.Teams.Entities;

namespace TaskManager.Api.Modules.Teams.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/teams")]
[Authorize]
public class TeamsController(AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<TeamDto>>> GetAll(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var teams = await db.Teams
            .Include(t => t.Members)
            .Where(t => t.WorkspaceId == workspace.Id)
            .OrderBy(t => t.Name)
            .ToListAsync(ct);

        return Ok(teams.Select(MapToDto));
    }

    [HttpPost]
    public async Task<ActionResult<TeamDto>> Create(string workspaceSlug, [FromBody] CreateTeamDto dto, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var team = new Team
        {
            Name = dto.Name,
            Description = dto.Description,
            Identifier = dto.Identifier,
            WorkspaceId = workspace.Id,
            CreatedById = CurrentUserId
        };
        db.Teams.Add(team);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, teamId = team.Id }, MapToDto(team));
    }

    [HttpGet("{teamId:guid}")]
    public async Task<ActionResult<TeamDto>> GetById(string workspaceSlug, Guid teamId, CancellationToken ct)
    {
        var team = await db.Teams
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == teamId, ct);
        if (team is null) return NotFound();
        return Ok(MapToDto(team));
    }

    [HttpPatch("{teamId:guid}")]
    public async Task<ActionResult<TeamDto>> Update(string workspaceSlug, Guid teamId, [FromBody] UpdateTeamDto dto, CancellationToken ct)
    {
        var team = await db.Teams
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == teamId, ct);
        if (team is null) return NotFound();

        if (dto.Name is not null) team.Name = dto.Name;
        if (dto.Description is not null) team.Description = dto.Description;
        if (dto.Identifier is not null) team.Identifier = dto.Identifier;
        if (dto.LogoUrl is not null) team.LogoUrl = dto.LogoUrl;
        await db.SaveChangesAsync(ct);
        return Ok(MapToDto(team));
    }

    [HttpDelete("{teamId:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid teamId, CancellationToken ct)
    {
        var team = await db.Teams.FirstOrDefaultAsync(t => t.Id == teamId, ct);
        if (team is null) return NotFound();
        team.IsDeleted = true;
        team.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("{teamId:guid}/members")]
    public async Task<ActionResult<List<TeamMemberDto>>> GetMembers(string workspaceSlug, Guid teamId, CancellationToken ct)
    {
        var members = await db.TeamMembers
            .Include(m => m.User)
            .Where(m => m.TeamId == teamId)
            .ToListAsync(ct);
        return Ok(members.Select(MapMemberToDto));
    }

    [HttpPost("{teamId:guid}/members")]
    public async Task<IActionResult> AddMember(string workspaceSlug, Guid teamId, [FromBody] AddTeamMemberDto dto, CancellationToken ct)
    {
        if (await db.TeamMembers.AnyAsync(m => m.TeamId == teamId && m.UserId == dto.UserId, ct))
            return Conflict("User is already a member.");

        db.TeamMembers.Add(new TeamMember { TeamId = teamId, UserId = dto.UserId });
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{teamId:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(string workspaceSlug, Guid teamId, Guid userId, CancellationToken ct)
    {
        var member = await db.TeamMembers.FirstOrDefaultAsync(m => m.TeamId == teamId && m.UserId == userId, ct);
        if (member is null) return NotFound();
        member.IsDeleted = true;
        member.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
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
