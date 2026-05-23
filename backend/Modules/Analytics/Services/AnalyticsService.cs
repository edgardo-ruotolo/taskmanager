using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Analytics.Dtos;
using TaskManager.Api.Modules.Analytics.Entities;
using TaskManager.Api.Modules.Cycles.Entities;
using TaskManager.Api.Modules.Issues.Entities;
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

    // ─────────────────────────────────────────────────────────────────────
    // Admin analytics with filters
    // ─────────────────────────────────────────────────────────────────────

    private async Task<(Guid workspaceId, DateTime now)> ResolveWorkspaceAsync(string workspaceSlug, CancellationToken ct)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");
        return (workspace.Id, DateTime.UtcNow);
    }

    public async Task<IReadOnlyList<IssueGanttDto>> GetGanttAsync(
        string workspaceSlug, AnalyticsFilters filters, CancellationToken ct = default)
    {
        var (workspaceId, now) = await ResolveWorkspaceAsync(workspaceSlug, ct);

        var query = db.Issues.AsNoTracking()
            .ApplyAnalyticsFilters(filters, workspaceId)
            .Where(i => i.StartDate.HasValue || i.DueDate.HasValue);

        var rows = await query
            .Select(i => new IssueGanttDto
            {
                Id = i.Id,
                SequenceId = i.SequenceId,
                Title = i.Title,
                ProjectIdentifier = i.Project.Identifier,
                AssigneeId = i.AssigneeId,
                AssigneeName = i.Assignee != null
                    ? (i.Assignee.DisplayName ?? ((i.Assignee.FirstName ?? "") + " " + (i.Assignee.LastName ?? "")).Trim())
                    : null,
                AssigneeAvatarUrl = i.Assignee != null ? i.Assignee.AvatarUrl : null,
                LabelIds = i.Labels.Select(l => l.LabelId).ToList(),
                StateId = i.StateId,
                StateName = i.State.Name,
                StateColor = i.State.Color,
                StateCategory = i.State.Category,
                Priority = i.Priority,
                StartDate = i.StartDate ?? i.CreatedAt,
                DueDate = i.DueDate,
                CompletedAt = i.CompletedAt,
                IsOverdue = i.DueDate.HasValue
                            && i.DueDate.Value < now
                            && i.State.Category != StateCategory.Completed
                            && i.State.Category != StateCategory.Cancelled,
            })
            .OrderBy(r => r.StartDate ?? r.DueDate)
            .ToListAsync(ct);

        return rows;
    }

    public async Task<IReadOnlyList<BurndownPoint>> GetBurndownAsync(
        string workspaceSlug, AnalyticsFilters filters, CancellationToken ct = default)
    {
        var (workspaceId, now) = await ResolveWorkspaceAsync(workspaceSlug, ct);

        DateTime rangeStart;
        DateTime rangeEnd;

        if (filters.CycleId.HasValue)
        {
            var cycle = await db.Cycles.AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == filters.CycleId.Value, ct)
                ?? throw new NotFoundException($"Cycle '{filters.CycleId.Value}' not found.");

            rangeStart = (cycle.StartDate ?? now.AddDays(-30)).Date;
            rangeEnd = (cycle.EndDate ?? now).Date;
        }
        else
        {
            rangeStart = (filters.DateFrom ?? now.AddDays(-30)).Date;
            rangeEnd = (filters.DateTo ?? now).Date;
        }

        if (rangeEnd < rangeStart) rangeEnd = rangeStart;

        var issues = await db.Issues.AsNoTracking()
            .ApplyAnalyticsFilters(filters, workspaceId)
            .Select(i => new
            {
                i.CreatedAt,
                i.CompletedAt,
                i.State.Category,
            })
            .ToListAsync(ct);

        var totalDays = (int)(rangeEnd - rangeStart).TotalDays;
        if (totalDays < 1) totalDays = 1;

        var totalAtStart = issues.Count(x => x.CreatedAt.Date <= rangeStart);
        var totalScope = issues.Count;

        var points = new List<BurndownPoint>();
        for (var i = 0; i <= totalDays; i++)
        {
            var day = rangeStart.AddDays(i);

            var scopeOnDay = issues.Count(x => x.CreatedAt.Date <= day);
            var completedOnDay = issues.Count(x =>
                x.Category == StateCategory.Completed
                && x.CompletedAt.HasValue
                && x.CompletedAt.Value.Date <= day);

            var remaining = scopeOnDay - completedOnDay;
            var ideal = totalScope - ((double)totalScope * i / totalDays);
            if (ideal < 0) ideal = 0;

            points.Add(new BurndownPoint(
                Date: day,
                Total: scopeOnDay,
                Remaining: remaining,
                Completed: completedOnDay,
                Ideal: Math.Round(ideal, 2)));
        }

        return points;
    }

    public async Task<PagedResult<IssueRowDto>> GetDrilldownAsync(
        string workspaceSlug, AnalyticsFilters filters, int page, int pageSize,
        string? sortBy, bool sortDesc, CancellationToken ct = default)
    {
        var (workspaceId, now) = await ResolveWorkspaceAsync(workspaceSlug, ct);

        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 200) pageSize = 200;

        var query = db.Issues.AsNoTracking()
            .ApplyAnalyticsFilters(filters, workspaceId);

        query = (sortBy?.ToLowerInvariant()) switch
        {
            "duedate" => sortDesc
                ? query.OrderByDescending(i => i.DueDate).ThenByDescending(i => i.SequenceId)
                : query.OrderBy(i => i.DueDate).ThenBy(i => i.SequenceId),
            "priority" => sortDesc
                ? query.OrderByDescending(i => i.Priority).ThenByDescending(i => i.SequenceId)
                : query.OrderBy(i => i.Priority).ThenBy(i => i.SequenceId),
            "state" => sortDesc
                ? query.OrderByDescending(i => i.State.Name).ThenByDescending(i => i.SequenceId)
                : query.OrderBy(i => i.State.Name).ThenBy(i => i.SequenceId),
            "assignee" => sortDesc
                ? query.OrderByDescending(i => i.Assignee != null ? i.Assignee.DisplayName : "")
                       .ThenByDescending(i => i.SequenceId)
                : query.OrderBy(i => i.Assignee != null ? i.Assignee.DisplayName : "")
                       .ThenBy(i => i.SequenceId),
            _ => sortDesc
                ? query.OrderByDescending(i => i.CreatedAt)
                : query.OrderByDescending(i => i.CreatedAt),
        };

        var total = await query.CountAsync(ct);

        var rows = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new
            {
                i.Id,
                i.SequenceId,
                i.Title,
                ProjectIdentifier = i.Project.Identifier,
                i.AssigneeId,
                AssigneeFirstName = i.Assignee != null ? i.Assignee.FirstName : null,
                AssigneeLastName = i.Assignee != null ? i.Assignee.LastName : null,
                AssigneeDisplayName = i.Assignee != null ? i.Assignee.DisplayName : null,
                AssigneeAvatarUrl = i.Assignee != null ? i.Assignee.AvatarUrl : null,
                LabelNames = i.Labels.Select(l => l.Label.Name).ToList(),
                LabelIds = i.Labels.Select(l => l.LabelId).ToList(),
                i.StateId,
                StateName = i.State.Name,
                StateColor = i.State.Color,
                i.Priority,
                i.StartDate,
                i.DueDate,
                i.CompletedAt,
                i.CreatedAt,
            })
            .ToListAsync(ct);

        var items = rows.Select(r => new IssueRowDto
        {
            Id = r.Id,
            SequenceId = r.SequenceId,
            Title = r.Title,
            ProjectIdentifier = r.ProjectIdentifier,
            AssigneeId = r.AssigneeId,
            AssigneeName = r.AssigneeDisplayName
                ?? string.Concat(r.AssigneeFirstName ?? string.Empty, " ", r.AssigneeLastName ?? string.Empty).Trim() switch
                {
                    "" => null,
                    var s => s,
                },
            AssigneeAvatarUrl = r.AssigneeAvatarUrl,
            LabelNames = r.LabelNames,
            LabelIds = r.LabelIds,
            StateId = r.StateId,
            StateName = r.StateName,
            StateColor = r.StateColor,
            Priority = r.Priority,
            StartDate = r.StartDate,
            DueDate = r.DueDate,
            CompletedAt = r.CompletedAt,
            CreatedAt = r.CreatedAt,
            DaysInProgress = Math.Round(
                ((r.CompletedAt ?? now) - (r.StartDate ?? r.CreatedAt)).TotalDays, 2),
        }).ToList();

        return new PagedResult<IssueRowDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<IReadOnlyList<UserRankingDto>> GetUserRankingAsync(
        string workspaceSlug, AnalyticsFilters filters, CancellationToken ct = default)
    {
        var (workspaceId, now) = await ResolveWorkspaceAsync(workspaceSlug, ct);
        var thirtyDaysAgo = now.AddDays(-30);

        var rows = await db.Issues.AsNoTracking()
            .ApplyAnalyticsFilters(filters, workspaceId)
            .Where(i => i.AssigneeId.HasValue)
            .Select(i => new
            {
                UserId = i.AssigneeId!.Value,
                FirstName = i.Assignee!.FirstName,
                LastName = i.Assignee.LastName,
                DisplayName = i.Assignee.DisplayName,
                Email = i.Assignee.Email,
                AvatarUrl = i.Assignee.AvatarUrl,
                Category = i.State.Category,
                i.DueDate,
                i.StartDate,
                i.CreatedAt,
                i.CompletedAt,
            })
            .ToListAsync(ct);

        var grouped = rows
            .GroupBy(r => new { r.UserId, r.FirstName, r.LastName, r.DisplayName, r.Email, r.AvatarUrl })
            .Select(g =>
            {
                var assigned = g.Count();
                var completed = g.Count(x => x.Category == StateCategory.Completed);
                var inProgress = g.Count(x => x.Category == StateCategory.Started);
                var overdue = g.Count(x =>
                    x.DueDate.HasValue
                    && x.DueDate.Value < now
                    && x.Category != StateCategory.Completed
                    && x.Category != StateCategory.Cancelled);

                var completedItems = g
                    .Where(x => x.Category == StateCategory.Completed && x.CompletedAt.HasValue)
                    .Select(x => ((x.CompletedAt!.Value) - (x.StartDate ?? x.CreatedAt)).TotalDays)
                    .ToList();

                var avgResolution = completedItems.Count > 0 ? completedItems.Average() : 0d;

                var lastMonthCompleted = g.Count(x =>
                    x.Category == StateCategory.Completed
                    && x.CompletedAt.HasValue
                    && x.CompletedAt.Value >= thirtyDaysAgo);

                var throughput = lastMonthCompleted / 4.28d;

                var fullName = g.Key.DisplayName
                    ?? string.Concat(g.Key.FirstName ?? string.Empty, " ", g.Key.LastName ?? string.Empty).Trim();
                if (string.IsNullOrWhiteSpace(fullName)) fullName = g.Key.Email ?? "—";

                return new UserRankingDto
                {
                    UserId = g.Key.UserId,
                    FullName = fullName,
                    Email = g.Key.Email,
                    AvatarUrl = g.Key.AvatarUrl,
                    Assigned = assigned,
                    Completed = completed,
                    InProgress = inProgress,
                    Overdue = overdue,
                    AvgResolutionDays = Math.Round(avgResolution, 2),
                    ThroughputPerWeek = Math.Round(throughput, 2),
                };
            })
            .OrderByDescending(r => r.Completed)
            .ThenByDescending(r => r.Assigned)
            .ToList();

        return grouped;
    }

    public async Task<IReadOnlyList<ClientComparisonDto>> GetClientComparisonAsync(
        string workspaceSlug, AnalyticsFilters filters, CancellationToken ct = default)
    {
        var (workspaceId, now) = await ResolveWorkspaceAsync(workspaceSlug, ct);

        var labels = await db.Labels.AsNoTracking()
            .Where(l => l.WorkspaceId == workspaceId)
            .Select(l => new { l.Id, l.Name, l.Color })
            .ToListAsync(ct);

        if (labels.Count == 0)
        {
            return Array.Empty<ClientComparisonDto>();
        }

        var labelIds = labels.Select(l => l.Id).ToList();

        // Pull all matching issue-label pairs with relevant fields, then aggregate in-memory.
        var pairs = await db.IssueLabels.AsNoTracking()
            .Where(il => labelIds.Contains(il.LabelId))
            .Where(il =>
                db.Issues.AsNoTracking()
                    .ApplyAnalyticsFilters(filters, workspaceId)
                    .Any(i => i.Id == il.IssueId))
            .Select(il => new
            {
                il.LabelId,
                Category = il.Issue.State.Category,
                il.Issue.DueDate,
                il.Issue.StartDate,
                il.Issue.CreatedAt,
                il.Issue.CompletedAt,
            })
            .ToListAsync(ct);

        var grouped = labels
            .GroupJoin(pairs, l => l.Id, p => p.LabelId, (l, ps) => new { Label = l, Pairs = ps.ToList() })
            .Select(x =>
            {
                var total = x.Pairs.Count;
                var completed = x.Pairs.Count(p => p.Category == StateCategory.Completed);
                var open = x.Pairs.Count(p =>
                    p.Category != StateCategory.Completed && p.Category != StateCategory.Cancelled);
                var overdue = x.Pairs.Count(p =>
                    p.DueDate.HasValue
                    && p.DueDate.Value < now
                    && p.Category != StateCategory.Completed
                    && p.Category != StateCategory.Cancelled);

                var completedItems = x.Pairs
                    .Where(p => p.Category == StateCategory.Completed && p.CompletedAt.HasValue)
                    .Select(p => (p.CompletedAt!.Value - (p.StartDate ?? p.CreatedAt)).TotalDays)
                    .ToList();

                var avg = completedItems.Count > 0 ? completedItems.Average() : 0d;
                var pct = total > 0 ? (double)completed * 100d / total : 0d;

                return new ClientComparisonDto
                {
                    LabelId = x.Label.Id,
                    LabelName = x.Label.Name,
                    LabelColor = x.Label.Color,
                    Total = total,
                    Open = open,
                    Completed = completed,
                    Overdue = overdue,
                    PercentComplete = Math.Round(pct, 2),
                    AvgResolutionDays = Math.Round(avg, 2),
                };
            })
            .OrderByDescending(r => r.Total)
            .ThenBy(r => r.LabelName)
            .ToList();

        return grouped;
    }
}
