using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/projects/{projectId:guid}/issue-types")]
[Authorize]
[ServiceFilter(typeof(RequireProjectMemberAttribute))]
public class ProjectIssueTypesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<IssueTypeDto>>> GetAll(
        string workspaceSlug, Guid projectId, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var types = await db.ProjectIssueTypes
            .Include(cit => cit.IssueType)
            .Where(cit => cit.ProjectId == projectId && cit.Project.WorkspaceId == workspace.Id)
            .Select(cit => new IssueTypeDto
            {
                Id = cit.IssueType.Id,
                Name = cit.IssueType.Name,
                Description = cit.IssueType.Description,
                Color = cit.IssueType.Color,
                Icon = cit.IssueType.Icon,
                IsDefault = cit.IssueType.IsDefault,
                WorkspaceId = cit.IssueType.WorkspaceId
            })
            .ToListAsync(ct);

        return Ok(types);
    }

    [HttpPost]
    public async Task<IActionResult> Associate(
        string workspaceSlug, Guid projectId, [FromBody] AssociateIssueTypeDto dto, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Projects.FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var issueType = await db.IssueTypes.FirstOrDefaultAsync(t => t.Id == dto.IssueTypeId && t.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("IssueType not found.");

        var exists = await db.ProjectIssueTypes.AnyAsync(cit => cit.ProjectId == projectId && cit.IssueTypeId == dto.IssueTypeId, ct);
        if (!exists)
        {
            db.ProjectIssueTypes.Add(new ProjectIssueType { ProjectId = projectId, IssueTypeId = dto.IssueTypeId });
            await db.SaveChangesAsync(ct);
        }

        return NoContent();
    }

    [HttpDelete("{issueTypeId:guid}")]
    public async Task<IActionResult> Dissociate(
        string workspaceSlug, Guid projectId, Guid issueTypeId, CancellationToken ct)
    {
        var entry = await db.ProjectIssueTypes
            .FirstOrDefaultAsync(cit => cit.ProjectId == projectId && cit.IssueTypeId == issueTypeId, ct)
            ?? throw new NotFoundException("Association not found.");

        db.ProjectIssueTypes.Remove(entry);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
