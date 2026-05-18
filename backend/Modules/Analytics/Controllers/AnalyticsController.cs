using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Analytics.Dtos;
using TaskManager.Api.Modules.Analytics.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Analytics.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/analytics")]
[Authorize]
public class AnalyticsController(AppDbContext db) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var now = DateTime.UtcNow;

        var total = await db.Issues
            .Where(i => i.Company.WorkspaceId == workspace.Id)
            .CountAsync(ct);

        var completed = await db.Issues
            .Where(i => i.Company.WorkspaceId == workspace.Id && i.State.Category == StateCategory.Completed)
            .CountAsync(ct);

        var inProgress = await db.Issues
            .Where(i => i.Company.WorkspaceId == workspace.Id && i.State.Category == StateCategory.Started)
            .CountAsync(ct);

        var overdue = await db.Issues
            .Where(i => i.Company.WorkspaceId == workspace.Id
                        && i.DueDate.HasValue
                        && i.DueDate.Value < now
                        && i.State.Category != StateCategory.Completed
                        && i.State.Category != StateCategory.Cancelled)
            .CountAsync(ct);

        return Ok(new { total, completed, inProgress, overdue });
    }

    [HttpGet("issues-by-state")]
    public async Task<IActionResult> GetIssuesByState(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var result = await db.Issues
            .Where(i => i.Company.WorkspaceId == workspace.Id)
            .GroupBy(i => new { i.StateId, i.State.Name })
            .Select(g => new { stateName = g.Key.Name, count = g.Count() })
            .ToListAsync(ct);

        return Ok(result);
    }

    [HttpGet("issues-by-priority")]
    public async Task<IActionResult> GetIssuesByPriority(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var result = await db.Issues
            .Where(i => i.Company.WorkspaceId == workspace.Id)
            .GroupBy(i => i.Priority)
            .Select(g => new { priority = g.Key.ToString(), count = g.Count() })
            .ToListAsync(ct);

        return Ok(result);
    }

    [HttpGet("created-vs-resolved")]
    public async Task<IActionResult> GetCreatedVsResolved(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var since = DateTime.UtcNow.AddDays(-30);

        var created = await db.Issues
            .Where(i => i.Company.WorkspaceId == workspace.Id && i.CreatedAt >= since)
            .GroupBy(i => i.CreatedAt.Date)
            .Select(g => new { date = g.Key, count = g.Count() })
            .ToListAsync(ct);

        var resolved = await db.Issues
            .Where(i => i.Company.WorkspaceId == workspace.Id
                        && i.State.Category == StateCategory.Completed
                        && i.UpdatedAt >= since)
            .GroupBy(i => i.UpdatedAt.Date)
            .Select(g => new { date = g.Key, count = g.Count() })
            .ToListAsync(ct);

        var allDates = created.Select(c => c.date)
            .Union(resolved.Select(r => r.date))
            .OrderBy(d => d);

        var result = allDates.Select(date => new
        {
            date,
            created = created.FirstOrDefault(c => c.date == date)?.count ?? 0,
            resolved = resolved.FirstOrDefault(r => r.date == date)?.count ?? 0
        });

        return Ok(result);
    }

    // Saved analytic views

    [HttpGet("views")]
    public async Task<ActionResult<List<AnalyticViewDto>>> GetViews(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var userId = CurrentUserId;
        var views = await db.AnalyticViews
            .Where(v => v.WorkspaceId == workspace.Id && (v.IsGlobal || v.OwnedById == userId))
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync(ct);

        return Ok(views.Select(MapToDto));
    }

    [HttpPost("views")]
    public async Task<ActionResult<AnalyticViewDto>> CreateView(
        string workspaceSlug, [FromBody] CreateAnalyticViewDto dto, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var view = new AnalyticView
        {
            Name = dto.Name,
            Description = dto.Description,
            Query = dto.Query,
            IsGlobal = dto.IsGlobal,
            WorkspaceId = workspace.Id,
            OwnedById = CurrentUserId
        };

        db.AnalyticViews.Add(view);
        await db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetViews), new { workspaceSlug }, MapToDto(view));
    }

    [HttpPatch("views/{viewId:guid}")]
    public async Task<ActionResult<AnalyticViewDto>> UpdateView(
        string workspaceSlug, Guid viewId, [FromBody] UpdateAnalyticViewDto dto, CancellationToken ct)
    {
        var view = await db.AnalyticViews
            .FirstOrDefaultAsync(v => v.Id == viewId && v.OwnedById == CurrentUserId, ct);

        if (view is null) return NotFound();

        if (dto.Name is not null) view.Name = dto.Name;
        if (dto.Description is not null) view.Description = dto.Description;
        if (dto.Query is not null) view.Query = dto.Query;
        if (dto.IsGlobal.HasValue) view.IsGlobal = dto.IsGlobal.Value;

        await db.SaveChangesAsync(ct);
        return Ok(MapToDto(view));
    }

    [HttpDelete("views/{viewId:guid}")]
    public async Task<IActionResult> DeleteView(string workspaceSlug, Guid viewId, CancellationToken ct)
    {
        var view = await db.AnalyticViews
            .FirstOrDefaultAsync(v => v.Id == viewId && v.OwnedById == CurrentUserId, ct);

        if (view is null) return NotFound();

        view.IsDeleted = true;
        view.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return NoContent();
    }

    private static AnalyticViewDto MapToDto(AnalyticView v) => new()
    {
        Id = v.Id,
        Name = v.Name,
        Description = v.Description,
        Query = v.Query,
        IsGlobal = v.IsGlobal,
        WorkspaceId = v.WorkspaceId,
        OwnedById = v.OwnedById,
        CreatedAt = v.CreatedAt
    };
}
