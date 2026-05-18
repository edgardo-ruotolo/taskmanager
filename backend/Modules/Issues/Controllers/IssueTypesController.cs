using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Services;

namespace TaskManager.Api.Modules.Issues.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/issue-types")]
public class IssueTypesController(IIssueTypeService issueTypeService, AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<IssueTypeDto>>> GetTypes(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var types = await issueTypeService.GetTypesAsync(workspace.Id, ct);
        return Ok(types);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<IssueTypeDto>> CreateType(string workspaceSlug, [FromBody] CreateIssueTypeDto dto, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var issueType = await issueTypeService.CreateTypeAsync(workspace.Id, dto, ct);
        return CreatedAtAction(nameof(GetTypes), new { workspaceSlug }, issueType);
    }

    [HttpDelete("{typeId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteType(string workspaceSlug, Guid typeId, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        await issueTypeService.DeleteTypeAsync(typeId, ct);
        return NoContent();
    }
}
