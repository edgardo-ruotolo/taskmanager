using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Analytics.Dtos;
using TaskManager.Api.Modules.Analytics.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Analytics.Services;

public class AnalyticsService(AppDbContext db) : IAnalyticsService
{
    public async Task<OverviewMetrics> GetOverviewAsync(string workspaceSlug, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var now = DateTime.UtcNow;

        var total = await db.Issues.AsNoTracking()
            .Where(i => i.Project.WorkspaceId == workspace.Id)
            .CountAsync(ct);

        var completed = await db.Issues.AsNoTracking()
            .Where(i => i.Project.WorkspaceId == workspace.Id && i.State.Category == StateCategory.Completed)
            .CountAsync(ct);

        var inProgress = await db.Issues.AsNoTracking()
            .Where(i => i.Project.WorkspaceId == workspace.Id && i.State.Category == StateCategory.Started)
            .CountAsync(ct);

        var overdue = await db.Issues.AsNoTracking()
            .Where(i => i.Project.WorkspaceId == workspace.Id
                        && i.DueDate.HasValue
                        && i.DueDate.Value < now
                        && i.State.Category != StateCategory.Completed
                        && i.State.Category != StateCategory.Cancelled)
            .CountAsync(ct);

        return new OverviewMetrics(total, completed, inProgress, overdue);
    }

    public async Task<IReadOnlyList<StateBucket>> GetIssuesByStateAsync(string workspaceSlug, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        return await db.Issues.AsNoTracking()
            .Where(i => i.Project.WorkspaceId == workspace.Id)
            .GroupBy(i => new { i.StateId, i.State.Name })
            .Select(g => new StateBucket(g.Key.Name, g.Count()))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<PriorityBucket>> GetIssuesByPriorityAsync(string workspaceSlug, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        return await db.Issues.AsNoTracking()
            .Where(i => i.Project.WorkspaceId == workspace.Id)
            .GroupBy(i => i.Priority)
            .Select(g => new PriorityBucket(g.Key.ToString(), g.Count()))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<CreatedVsResolvedPoint>> GetCreatedVsResolvedAsync(string workspaceSlug, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var since = DateTime.UtcNow.AddDays(-30);

        var created = await db.Issues.AsNoTracking()
            .Where(i => i.Project.WorkspaceId == workspace.Id && i.CreatedAt >= since)
            .GroupBy(i => i.CreatedAt.Date)
            .Select(g => new { date = g.Key, count = g.Count() })
            .ToListAsync(ct);

        var resolved = await db.Issues.AsNoTracking()
            .Where(i => i.Project.WorkspaceId == workspace.Id
                        && i.State.Category == StateCategory.Completed
                        && i.UpdatedAt >= since)
            .GroupBy(i => i.UpdatedAt.Date)
            .Select(g => new { date = g.Key, count = g.Count() })
            .ToListAsync(ct);

        return created.Select(c => c.date)
            .Union(resolved.Select(r => r.date))
            .OrderBy(d => d)
            .Select(date => new CreatedVsResolvedPoint(
                date,
                created.FirstOrDefault(c => c.date == date)?.count ?? 0,
                resolved.FirstOrDefault(r => r.date == date)?.count ?? 0))
            .ToList();
    }

    public async Task<ProjectOverview> GetProjectOverviewAsync(string workspaceSlug, string projectIdentifier, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.AsNoTracking()
            .FirstOrDefaultAsync(c => c.WorkspaceId == workspace.Id
                && c.Identifier == projectIdentifier.ToUpper(), ct)
            ?? throw new NotFoundException($"Project '{projectIdentifier}' not found.");

        var issuesByState = await db.Issues.AsNoTracking()
            .Where(i => i.ProjectId == project.Id)
            .GroupBy(i => new { i.StateId, i.State.Name })
            .Select(g => new ProjectStateBucket(g.Key.StateId, g.Key.Name, g.Count()))
            .ToListAsync(ct);

        var issuesByPriority = await db.Issues.AsNoTracking()
            .Where(i => i.ProjectId == project.Id)
            .GroupBy(i => i.Priority)
            .Select(g => new PriorityBucket(g.Key.ToString(), g.Count()))
            .ToListAsync(ct);

        return new ProjectOverview(issuesByState, issuesByPriority);
    }

    public async Task<IReadOnlyList<ProjectActivityPoint>> GetProjectActivityAsync(string workspaceSlug, string projectIdentifier, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.AsNoTracking()
            .FirstOrDefaultAsync(c => c.WorkspaceId == workspace.Id
                && c.Identifier == projectIdentifier.ToUpper(), ct)
            ?? throw new NotFoundException($"Project '{projectIdentifier}' not found.");

        var since = DateTime.UtcNow.Date.AddDays(-29);

        var completedByDay = await db.Issues.AsNoTracking()
            .Where(i => i.ProjectId == project.Id
                && i.State.Category == StateCategory.Completed
                && i.UpdatedAt >= since)
            .GroupBy(i => i.UpdatedAt.Date)
            .Select(g => new { date = g.Key, completed = g.Count() })
            .ToListAsync(ct);

        return Enumerable.Range(0, 30)
            .Select(offset => DateTime.UtcNow.Date.AddDays(-29 + offset))
            .Select(date => new ProjectActivityPoint(
                date.ToString("yyyy-MM-dd"),
                completedByDay.FirstOrDefault(d => d.date == date)?.completed ?? 0))
            .ToList();
    }

    public async Task<IReadOnlyList<AnalyticViewDto>> GetViewsAsync(string workspaceSlug, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var views = await db.AnalyticViews.AsNoTracking()
            .Where(v => v.WorkspaceId == workspace.Id && (v.IsGlobal || v.OwnedById == userId))
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync(ct);

        return views.Select(MapToDto).ToList();
    }

    public async Task<AnalyticViewDto> CreateViewAsync(string workspaceSlug, Guid userId, CreateAnalyticViewDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var view = new AnalyticView
        {
            Name = dto.Name,
            Description = dto.Description,
            Query = dto.Query,
            IsGlobal = dto.IsGlobal,
            WorkspaceId = workspace.Id,
            OwnedById = userId
        };

        db.AnalyticViews.Add(view);
        await db.SaveChangesAsync(ct);

        return MapToDto(view);
    }

    public async Task<AnalyticViewDto?> UpdateViewAsync(Guid viewId, Guid userId, UpdateAnalyticViewDto dto, CancellationToken ct = default)
    {
        var view = await db.AnalyticViews
            .FirstOrDefaultAsync(v => v.Id == viewId && v.OwnedById == userId, ct);

        if (view is null) return null;

        if (dto.Name is not null) view.Name = dto.Name;
        if (dto.Description is not null) view.Description = dto.Description;
        if (dto.Query is not null) view.Query = dto.Query;
        if (dto.IsGlobal.HasValue) view.IsGlobal = dto.IsGlobal.Value;

        await db.SaveChangesAsync(ct);
        return MapToDto(view);
    }

    public async Task<bool> DeleteViewAsync(Guid viewId, Guid userId, CancellationToken ct = default)
    {
        var view = await db.AnalyticViews
            .FirstOrDefaultAsync(v => v.Id == viewId && v.OwnedById == userId, ct);

        if (view is null) return false;

        view.IsDeleted = true;
        view.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return true;
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
