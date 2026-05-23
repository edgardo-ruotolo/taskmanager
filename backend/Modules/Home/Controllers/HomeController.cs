using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Common.Auth;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Authorization;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Home.Dtos;
using TaskManager.Api.Modules.Home.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Home.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceSlug}/home")]
[Authorize]
[ServiceFilter(typeof(RequireWorkspaceMemberAttribute))]
public class HomeController(AppDbContext db, ICurrentUser currentUser) : ControllerBase
{

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(string workspaceSlug, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var todayUtc = DateTime.UtcNow.Date;

        var totalIssues = await db.Issues
            .Where(i => i.Project.WorkspaceId == workspace.Id)
            .CountAsync(ct);

        var unassignedIssues = await db.Issues
            .Where(i => i.Project.WorkspaceId == workspace.Id
                && !i.Assignees.Any())
            .CountAsync(ct);

        var completedToday = await db.Issues
            .Where(i => i.Project.WorkspaceId == workspace.Id
                && i.State.Category == StateCategory.Completed
                && i.UpdatedAt >= todayUtc)
            .CountAsync(ct);

        var inProgress = await db.Issues
            .Where(i => i.Project.WorkspaceId == workspace.Id
                && i.State.Category == StateCategory.Started)
            .CountAsync(ct);

        var pending = await db.Issues
            .Where(i => i.Project.WorkspaceId == workspace.Id
                && (i.State.Category == StateCategory.Unstarted
                    || i.State.Category == StateCategory.Backlog))
            .CountAsync(ct);

        return Ok(new
        {
            totalIssues,
            unassignedIssues,
            completedToday,
            inProgress,
            pending
        });
    }

    // Recent visits
    [HttpGet("recent-visits")]
    public async Task<ActionResult<List<UserRecentVisitDto>>> GetRecentVisits(
        string workspaceSlug, [FromQuery] int limit = 20, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var visits = await db.UserRecentVisits
            .AsNoTracking()
            .Where(v => v.WorkspaceId == workspace.Id && v.UserId == currentUser.UserId)
            .OrderByDescending(v => v.VisitedAt)
            .Take(limit)
            .ToListAsync(ct);

        return Ok(visits.Select(v => new UserRecentVisitDto
        {
            Id = v.Id, EntityType = v.EntityType, EntityId = v.EntityId,
            EntityTitle = v.EntityTitle, EntityUrl = v.EntityUrl, VisitedAt = v.VisitedAt
        }));
    }

    [HttpPost("track-visit")]
    public async Task<IActionResult> TrackVisit(
        string workspaceSlug, [FromBody] TrackVisitDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        // Upsert: if same entity+user already exists, update VisitedAt
        var existing = await db.UserRecentVisits
            .FirstOrDefaultAsync(v => v.WorkspaceId == workspace.Id
                && v.UserId == currentUser.UserId
                && v.EntityType == dto.EntityType
                && v.EntityId == dto.EntityId, ct);

        if (existing is not null)
        {
            existing.VisitedAt = DateTime.UtcNow;
            existing.EntityTitle = dto.EntityTitle;
        }
        else
        {
            db.UserRecentVisits.Add(new UserRecentVisit
            {
                UserId = currentUser.UserId, WorkspaceId = workspace.Id,
                EntityType = dto.EntityType, EntityId = dto.EntityId,
                EntityTitle = dto.EntityTitle, EntityUrl = dto.EntityUrl,
                VisitedAt = DateTime.UtcNow
            });

            // Keep only last 50 visits per user per workspace
            var count = await db.UserRecentVisits
                .CountAsync(v => v.WorkspaceId == workspace.Id && v.UserId == currentUser.UserId, ct);
            if (count > 50)
            {
                var oldest = await db.UserRecentVisits
                    .Where(v => v.WorkspaceId == workspace.Id && v.UserId == currentUser.UserId)
                    .OrderBy(v => v.VisitedAt).FirstAsync(ct);
                oldest.IsDeleted = true; oldest.DeletedAt = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // Quick links
    [HttpGet("quick-links")]
    public async Task<ActionResult<List<WorkspaceQuickLinkDto>>> GetQuickLinks(
        string workspaceSlug, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var links = await db.WorkspaceQuickLinks
            .AsNoTracking()
            .Where(l => l.WorkspaceId == workspace.Id)
            .OrderBy(l => l.Sequence)
            .ToListAsync(ct);

        return Ok(links.Select(l => new WorkspaceQuickLinkDto
        {
            Id = l.Id, Title = l.Title, Url = l.Url,
            Description = l.Description, Icon = l.Icon,
            Sequence = l.Sequence, CreatedAt = l.CreatedAt
        }));
    }

    [HttpPost("quick-links")]
    public async Task<ActionResult<WorkspaceQuickLinkDto>> CreateQuickLink(
        string workspaceSlug, [FromBody] CreateQuickLinkDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var maxSeq = await db.WorkspaceQuickLinks
            .Where(l => l.WorkspaceId == workspace.Id)
            .Select(l => (int?)l.Sequence).MaxAsync(ct) ?? 0;

        var link = new WorkspaceQuickLink
        {
            WorkspaceId = workspace.Id, CreatedById = currentUser.UserId,
            Title = dto.Title, Url = dto.Url,
            Description = dto.Description, Icon = dto.Icon,
            Sequence = maxSeq + 1
        };

        db.WorkspaceQuickLinks.Add(link);
        await db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetQuickLinks), new { workspaceSlug }, new WorkspaceQuickLinkDto
        {
            Id = link.Id, Title = link.Title, Url = link.Url,
            Description = link.Description, Icon = link.Icon,
            Sequence = link.Sequence, CreatedAt = link.CreatedAt
        });
    }

    [HttpDelete("quick-links/{linkId:guid}")]
    public async Task<IActionResult> DeleteQuickLink(
        string workspaceSlug, Guid linkId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct);
        if (workspace is null) return NotFound();

        var link = await db.WorkspaceQuickLinks
            .FirstOrDefaultAsync(l => l.Id == linkId && l.WorkspaceId == workspace.Id, ct);
        if (link is null) return NotFound();
        link.IsDeleted = true; link.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
