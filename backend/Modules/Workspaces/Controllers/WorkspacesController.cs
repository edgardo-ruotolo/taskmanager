using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Services;

namespace TaskManager.Api.Modules.Workspaces.Controllers;

[ApiController]
[Route("api/workspaces")]
[Authorize]
public class WorkspacesController(IWorkspaceService workspaceService, ICurrentUser currentUser) : ControllerBase
{

    [HttpPost]
    public async Task<ActionResult<WorkspaceDto>> Create([FromBody] CreateWorkspaceDto dto, CancellationToken ct)
    {
        var workspace = await workspaceService.CreateAsync(currentUser.UserId, dto, ct);
        return CreatedAtAction(nameof(GetBySlug), new { slug = workspace.Slug }, workspace);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<WorkspaceDto>>> GetMine(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await workspaceService.GetUserWorkspacesAsync(currentUser.UserId, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<WorkspaceDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var workspace = await workspaceService.GetBySlugAsync(slug, ct);
        return Ok(workspace);
    }

    [HttpPatch("{slug}")]
    public async Task<ActionResult<WorkspaceDto>> Update(string slug, [FromBody] UpdateWorkspaceDto dto, CancellationToken ct)
    {
        var workspace = await workspaceService.UpdateAsync(slug, currentUser.UserId, dto, ct);
        return Ok(workspace);
    }

    [HttpDelete("{slug}")]
    public async Task<IActionResult> Delete(string slug, CancellationToken ct)
    {
        await workspaceService.DeleteAsync(slug, currentUser.UserId, ct);
        return NoContent();
    }

    // Members

    [HttpGet("{slug}/members")]
    public async Task<ActionResult<IEnumerable<WorkspaceMemberDto>>> GetMembers(string slug, CancellationToken ct)
    {
        var members = await workspaceService.GetMembersAsync(slug, ct);
        return Ok(members);
    }

    [HttpDelete("{slug}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(string slug, Guid userId, CancellationToken ct)
    {
        await workspaceService.RemoveMemberAsync(slug, userId, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpPatch("{slug}/members/{userId:guid}/role")]
    public async Task<ActionResult<WorkspaceMemberDto>> UpdateMemberRole(
        string slug, Guid userId, [FromBody] UpdateMemberRoleDto dto, CancellationToken ct)
    {
        var member = await workspaceService.UpdateMemberRoleAsync(slug, userId, dto, currentUser.UserId, ct);
        return Ok(member);
    }

    // Invitations

    [HttpGet("{slug}/invitations")]
    public async Task<ActionResult<IEnumerable<WorkspaceInvitationDto>>> GetPendingInvitations(string slug, CancellationToken ct)
    {
        var invitations = await workspaceService.GetPendingInvitationsAsync(slug, ct);
        return Ok(invitations);
    }

    [HttpPost("{slug}/invitations")]
    public async Task<ActionResult<WorkspaceInvitationDto>> InviteMember(
        string slug, [FromBody] CreateWorkspaceInvitationDto dto, CancellationToken ct)
    {
        var invitation = await workspaceService.InviteMemberAsync(slug, dto, currentUser.UserId, ct);
        return Ok(invitation);
    }

    [HttpPost("{slug}/invitations/{token}/accept")]
    public async Task<IActionResult> AcceptInvitation(string slug, string token, CancellationToken ct)
    {
        await workspaceService.AcceptInvitationAsync(token, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpDelete("{slug}/invitations/{id:guid}")]
    public async Task<IActionResult> RevokeInvitation(string slug, Guid id, CancellationToken ct)
    {
        await workspaceService.RevokeInvitationAsync(id, currentUser.UserId, ct);
        return NoContent();
    }
}
