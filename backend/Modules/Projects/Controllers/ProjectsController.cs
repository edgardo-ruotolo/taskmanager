using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Projects.Dtos;
using TaskManager.Api.Modules.Projects.Services;
using TaskManager.Api.Modules.States.Dtos;

namespace TaskManager.Api.Modules.Projects.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects")]
[Authorize]
public class ProjectsController(IProjectService projectService, AppDbContext db, ICurrentUser currentUser) : ControllerBase
{

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> Create(string workspaceSlug, [FromBody] CreateProjectDto dto, CancellationToken ct)
    {
        var project = await projectService.CreateAsync(workspaceSlug, currentUser.UserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { workspaceSlug, projectId = project.Id }, project);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProjectDto>>> GetAll(
        string workspaceSlug,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await projectService.GetAllAsync(workspaceSlug, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{projectId:guid}")]
    public async Task<ActionResult<ProjectDto>> GetById(string workspaceSlug, Guid projectId, CancellationToken ct)
    {
        var project = await projectService.GetByIdAsync(workspaceSlug, projectId, ct);
        return Ok(project);
    }

    [HttpPatch("{projectId:guid}")]
    public async Task<ActionResult<ProjectDto>> Update(string workspaceSlug, Guid projectId, [FromBody] UpdateProjectDto dto, CancellationToken ct)
    {
        var project = await projectService.UpdateAsync(workspaceSlug, projectId, currentUser.UserId, dto, ct);
        return Ok(project);
    }

    [HttpPatch("{projectId:guid}/team")]
    public async Task<ActionResult<ProjectDto>> UpdateTeam(string workspaceSlug, Guid projectId, [FromBody] UpdateProjectTeamDto dto, CancellationToken ct)
    {
        var project = await projectService.UpdateTeamAsync(workspaceSlug, projectId, currentUser.UserId, dto, ct);
        return Ok(project);
    }

    [HttpDelete("{projectId:guid}")]
    public async Task<IActionResult> Delete(string workspaceSlug, Guid projectId, CancellationToken ct)
    {
        await projectService.DeleteAsync(workspaceSlug, projectId, currentUser.UserId, ct);
        return NoContent();
    }

    // Members

    [HttpGet("{projectId:guid}/members")]
    public async Task<ActionResult<IEnumerable<ProjectMemberDto>>> GetMembers(string workspaceSlug, Guid projectId, CancellationToken ct)
    {
        var members = await projectService.GetMembersAsync(workspaceSlug, projectId, ct);
        return Ok(members);
    }

    [HttpPost("{projectId:guid}/members")]
    public async Task<ActionResult<ProjectMemberDto>> AddMember(
        string workspaceSlug, Guid projectId, [FromBody] AddProjectMemberDto dto, CancellationToken ct)
    {
        var member = await projectService.AddMemberAsync(workspaceSlug, projectId, dto, currentUser.UserId, ct);
        return Ok(member);
    }

    [HttpDelete("{projectId:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(string workspaceSlug, Guid projectId, Guid userId, CancellationToken ct)
    {
        await projectService.RemoveMemberAsync(workspaceSlug, projectId, userId, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpPatch("{projectId:guid}/members/{userId:guid}/role")]
    public async Task<ActionResult<ProjectMemberDto>> UpdateMemberRole(
        string workspaceSlug, Guid projectId, Guid userId, [FromBody] UpdateProjectMemberRoleDto dto, CancellationToken ct)
    {
        var member = await projectService.UpdateMemberRoleAsync(workspaceSlug, projectId, userId, dto, currentUser.UserId, ct);
        return Ok(member);
    }

    // Invitations

    [HttpGet("{projectId:guid}/invitations")]
    public async Task<ActionResult<IEnumerable<ProjectInvitationDto>>> GetPendingInvitations(string workspaceSlug, Guid projectId, CancellationToken ct)
    {
        var invitations = await projectService.GetPendingInvitationsAsync(workspaceSlug, projectId, ct);
        return Ok(invitations);
    }

    [HttpPost("{projectId:guid}/invitations")]
    public async Task<ActionResult<ProjectInvitationDto>> InviteMember(
        string workspaceSlug, Guid projectId, [FromBody] CreateProjectInvitationDto dto, CancellationToken ct)
    {
        var invitation = await projectService.InviteMemberAsync(workspaceSlug, projectId, dto, currentUser.UserId, ct);
        return Ok(invitation);
    }

    [HttpPost("{projectId:guid}/invitations/{token}/accept")]
    public async Task<IActionResult> AcceptInvitation(string workspaceSlug, Guid projectId, string token, CancellationToken ct)
    {
        await projectService.AcceptInvitationAsync(token, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpDelete("{projectId:guid}/invitations/{id:guid}")]
    public async Task<IActionResult> RevokeInvitation(string workspaceSlug, Guid projectId, Guid id, CancellationToken ct)
    {
        await projectService.RevokeInvitationAsync(id, currentUser.UserId, ct);
        return NoContent();
    }

    [HttpGet("{projectId:guid}/states")]
    public async Task<ActionResult<IEnumerable<StateDto>>> GetProjectStates(
        string workspaceSlug,
        Guid projectId,
        CancellationToken ct)
    {
        var project = await db.Projects
            .Where(c => c.Id == projectId)
            .Select(c => new { c.StateGroupId })
            .FirstOrDefaultAsync(ct);

        if (project is null) return NotFound();

        var states = await db.States
            .Where(s => s.StateGroupId == project.StateGroupId)
            .OrderBy(s => s.Sequence)
            .Select(s => new StateDto
            {
                Id = s.Id,
                Name = s.Name,
                Color = s.Color,
                Category = s.Category,
                Sequence = s.Sequence,
                IsDefault = s.IsDefault,
                StateGroupId = s.StateGroupId
            })
            .ToListAsync(ct);

        return Ok(states);
    }
}
