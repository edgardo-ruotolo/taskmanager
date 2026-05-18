using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;

namespace TaskManager.Api.Modules.Search.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/search")]
[Authorize]
public class SearchController(AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Search(
        string workspaceSlug,
        [FromQuery] string? q,
        CancellationToken ct)
    {
        var empty = new { issues = Array.Empty<object>(), cycles = Array.Empty<object>(), modules = Array.Empty<object>(), views = Array.Empty<object>(), labels = Array.Empty<object>() };

        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(empty);

        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var userId = CurrentUserId;
        var pattern = $"%{q.Trim()}%";

        var issues = await db.Issues
            .Where(i => i.Company.WorkspaceId == workspace.Id && EF.Functions.ILike(i.Title, pattern))
            .OrderBy(i => i.Title)
            .Take(10)
            .Select(i => new { i.Id, i.Title, i.SequenceId, i.CompanyId })
            .ToListAsync(ct);

        var cycles = await db.Cycles
            .Where(c => c.Company.WorkspaceId == workspace.Id && EF.Functions.ILike(c.Name, pattern))
            .OrderBy(c => c.Name)
            .Take(10)
            .Select(c => new { c.Id, c.Name, c.CompanyId })
            .ToListAsync(ct);

        var modules = await db.ProjectModules
            .Where(m => m.Company.WorkspaceId == workspace.Id && EF.Functions.ILike(m.Name, pattern))
            .OrderBy(m => m.Name)
            .Take(10)
            .Select(m => new { m.Id, m.Name, m.CompanyId })
            .ToListAsync(ct);

        var views = await db.IssueViews
            .Where(v => v.WorkspaceId == workspace.Id && (v.IsPublic || v.OwnerId == userId) && EF.Functions.ILike(v.Name, pattern))
            .OrderBy(v => v.Name)
            .Take(10)
            .Select(v => new { v.Id, v.Name, v.CompanyId })
            .ToListAsync(ct);

        var labels = await db.Labels
            .Where(l => l.WorkspaceId == workspace.Id && EF.Functions.ILike(l.Name, pattern))
            .OrderBy(l => l.Name)
            .Take(10)
            .Select(l => new { l.Id, l.Name, l.Color })
            .ToListAsync(ct);

        return Ok(new { issues, cycles, modules, views, labels });
    }
}
