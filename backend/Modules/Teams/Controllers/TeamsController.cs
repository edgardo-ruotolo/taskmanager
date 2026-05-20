using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Teams.Dtos;
using TaskManager.Api.Modules.Teams.Services;

namespace TaskManager.Api.Modules.Teams.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/teams")]
[Authorize]
public class TeamsController(ITeamService teamService, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<TeamDto>>> GetAll(
        string workspaceSlug,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await teamService.GetAllAsync(workspaceSlug, page, pageSize, ct));

    [HttpPost]
    public async Task<ActionResult<TeamDto>> Create(string workspaceSlug, [FromBody] CreateTeamDto dto, CancellationToken ct)
    {
        var team = await teamService.CreateAsync(workspaceSlug, currentUser.UserId, dto, ct);
        if (team is null) return NotFound();
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, teamId = team.Id }, team);
    }

    [HttpGet("{teamId:guid}")]
    public async Task<ActionResult<TeamDto>> GetById(string workspaceSlug, Guid teamId, CancellationToken ct)
    {
        var team = await teamService.GetByIdAsync(teamId, ct);
        return team is null ? NotFound() : Ok(team);
    }

    [HttpPatch("{teamId:guid}")]
    public async Task<ActionResult<TeamDto>> Update(string workspaceSlug, Guid teamId, [FromBody] UpdateTeamDto dto, CancellationToken ct)
    {
        var team = await teamService.UpdateAsync(teamId, dto, ct);
        return team is null ? NotFound() : Ok(team);
    }

    [HttpDelete("{teamId:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid teamId, CancellationToken ct)
        => await teamService.DeleteAsync(teamId, ct) ? NoContent() : NotFound();

    [HttpGet("{teamId:guid}/members")]
    public async Task<ActionResult<IReadOnlyList<TeamMemberDto>>> GetMembers(string workspaceSlug, Guid teamId, CancellationToken ct)
        => Ok(await teamService.GetMembersAsync(teamId, ct));

    [HttpPost("{teamId:guid}/members")]
    public async Task<IActionResult> AddMember(string workspaceSlug, Guid teamId, [FromBody] AddTeamMemberDto dto, CancellationToken ct)
    {
        var added = await teamService.AddMemberAsync(teamId, dto.UserId, ct);
        return added ? NoContent() : Conflict("User is already a member.");
    }

    [HttpDelete("{teamId:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(string workspaceSlug, Guid teamId, Guid userId, CancellationToken ct)
        => await teamService.RemoveMemberAsync(teamId, userId, ct) ? NoContent() : NotFound();
}
