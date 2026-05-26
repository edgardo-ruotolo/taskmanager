using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Cycles.Dtos;
using TaskManager.Api.Modules.Cycles.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Cycles.Services;

public class CycleService(AppDbContext db) : ICycleService
{
    public async Task<PagedResult<CycleDto>> GetAllAsync(string workspaceSlug, Guid projectId, int page, int pageSize, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var query = db.Cycles
            .AsNoTracking()
            .Include(c => c.CycleIssues)
            .Include(c => c.Lead)
            .Where(c => c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = items.Select(MapToDto).ToList();
        await EnrichCyclesAsync(dtos, ct);

        return new PagedResult<CycleDto>
        {
            Items = dtos,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CycleDto> GetByIdAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .AsNoTracking()
            .Include(c => c.CycleIssues)
            .Include(c => c.Lead)
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        var result = MapToDto(cycle);
        await EnrichCyclesAsync(new[] { result }, ct);
        return result;
    }

    public async Task<CycleDto> CreateAsync(string workspaceSlug, Guid projectId, Guid userId, CreateCycleDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var cycle = new Cycle
        {
            Name = dto.Name,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            ProjectId = project.Id,
            OwnerId = userId
        };

        db.Cycles.Add(cycle);
        await db.SaveChangesAsync(ct);

        var result = MapToDto(cycle);
        await EnrichCyclesAsync(new[] { result }, ct);
        return result;
    }

    public async Task<CycleDto> UpdateAsync(string workspaceSlug, Guid projectId, Guid cycleId, UpdateCycleDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .Include(c => c.CycleIssues)
            .Include(c => c.Lead)
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        if (dto.Name is not null) cycle.Name = dto.Name;
        if (dto.Description is not null) cycle.Description = dto.Description;
        if (dto.Status is not null) cycle.Status = dto.Status.Value;
        if (dto.StartDate is not null) cycle.StartDate = dto.StartDate;
        if (dto.EndDate is not null) cycle.EndDate = dto.EndDate;

        await db.SaveChangesAsync(ct);
        var result = MapToDto(cycle);
        await EnrichCyclesAsync(new[] { result }, ct);
        return result;
    }

    public async Task DeleteAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        cycle.IsDeleted = true;
        cycle.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task AddIssueAsync(string workspaceSlug, Guid projectId, Guid cycleId, Guid issueId, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        var issue = await db.Issues.FindAsync([issueId], ct)
            ?? throw new NotFoundException("Issue not found.");

        var alreadyExists = await db.CycleIssues
            .AnyAsync(ci => ci.CycleId == cycleId && ci.IssueId == issueId, ct);

        if (alreadyExists)
            throw new ValidationException("Issue is already in this cycle.");

        db.CycleIssues.Add(new CycleIssue
        {
            CycleId = cycleId,
            IssueId = issueId,
            AddedById = userId
        });

        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveIssueAsync(string workspaceSlug, Guid projectId, Guid cycleId, Guid issueId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Cycles
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        var cycleIssue = await db.CycleIssues
            .FirstOrDefaultAsync(ci => ci.CycleId == cycleId && ci.IssueId == issueId, ct)
            ?? throw new NotFoundException("Issue not found in this cycle.");

        cycleIssue.IsDeleted = true;
        cycleIssue.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<List<CycleDto>> GetArchivedAsync(string workspaceSlug, Guid projectId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var items = await db.Cycles
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Include(c => c.CycleIssues)
            .Include(c => c.Lead)
            .Where(c => c.IsArchived && !c.IsDeleted && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id)
            .OrderByDescending(c => c.ArchivedAt)
            .ToListAsync(ct);

        var dtos = items.Select(MapToDto).ToList();
        await EnrichCyclesAsync(dtos, ct);
        return dtos;
    }

    public async Task ArchiveAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id && !c.IsDeleted, ct)
            ?? throw new NotFoundException("Cycle not found.");

        cycle.IsArchived = true;
        cycle.ArchivedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task UnarchiveAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id && !c.IsDeleted, ct)
            ?? throw new NotFoundException("Cycle not found.");

        cycle.IsArchived = false;
        cycle.ArchivedAt = null;
        await db.SaveChangesAsync(ct);
    }

    public async Task TransferIssuesAsync(string workspaceSlug, Guid projectId, Guid sourceCycleId, Guid targetCycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Cycles
            .FirstOrDefaultAsync(c => c.Id == sourceCycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Source cycle not found.");

        _ = await db.Cycles
            .FirstOrDefaultAsync(c => c.Id == targetCycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Target cycle not found.");

        var incompleteCategories = new[] { StateCategory.Backlog, StateCategory.Unstarted, StateCategory.Started };

        var sourceIssues = await db.CycleIssues
            .Include(ci => ci.Issue)
                .ThenInclude(i => i.State)
            .Where(ci => ci.CycleId == sourceCycleId && incompleteCategories.Contains(ci.Issue.State.Category))
            .ToListAsync(ct);

        var existingTargetIssueIds = await db.CycleIssues
            .Where(ci => ci.CycleId == targetCycleId)
            .Select(ci => ci.IssueId)
            .ToListAsync(ct);

        foreach (var sourceIssue in sourceIssues)
        {
            sourceIssue.IsDeleted = true;
            sourceIssue.DeletedAt = DateTime.UtcNow;

            if (!existingTargetIssueIds.Contains(sourceIssue.IssueId))
            {
                db.CycleIssues.Add(new CycleIssue
                {
                    CycleId = targetCycleId,
                    IssueId = sourceIssue.IssueId,
                    AddedById = sourceIssue.AddedById
                });
            }
        }

        await db.SaveChangesAsync(ct);
    }

    public async Task<CycleProgressDto> GetProgressAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Cycles.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        var issues = await db.CycleIssues
            .AsNoTracking()
            .Where(ci => ci.CycleId == cycleId)
            .Select(ci => ci.Issue.State.Category)
            .ToListAsync(ct);

        var total = issues.Count;
        var completed = issues.Count(c => c == StateCategory.Completed || c == StateCategory.Cancelled);
        var inProgress = issues.Count(c => c == StateCategory.Started);
        var pending = issues.Count(c => c == StateCategory.Backlog || c == StateCategory.Unstarted);

        return new CycleProgressDto
        {
            TotalIssues = total,
            CompletedIssues = completed,
            InProgressIssues = inProgress,
            PendingIssues = pending,
            CompletionPercentage = total == 0 ? 0 : Math.Round((double)completed / total * 100, 2)
        };
    }

    public async Task<CycleAnalyticsDto> GetAnalyticsAsync(string workspaceSlug, Guid projectId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Cycles.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        var issues = await db.CycleIssues
            .AsNoTracking()
            .Where(ci => ci.CycleId == cycleId)
            .Select(ci => new { ci.Issue.Priority, StateName = ci.Issue.State.Name, StateCategory = ci.Issue.State.Category })
            .ToListAsync(ct);

        var total = issues.Count;
        var completed = issues.Count(i => i.StateCategory == StateCategory.Completed || i.StateCategory == StateCategory.Cancelled);

        return new CycleAnalyticsDto
        {
            TotalIssues = total,
            CompletedIssues = completed,
            CompletionPercentage = total == 0 ? 0 : Math.Round((double)completed / total * 100, 2),
            IssuesByPriority = issues
                .GroupBy(i => i.Priority.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),
            IssuesByState = issues
                .GroupBy(i => i.StateName)
                .ToDictionary(g => g.Key, g => g.Count())
        };
    }

    public async Task<CycleDto> CloseAsync(string workspaceSlug, Guid projectId, Guid cycleId, bool moveIncompleteToBacklog, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .Include(c => c.CycleIssues)
            .Include(c => c.Lead)
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.ProjectId == projectId && c.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        if (cycle.ClosedAt is not null)
            throw new ValidationException("Cycle is already closed.");

        cycle.Status = CycleStatus.Completed;
        cycle.ClosedAt = DateTime.UtcNow;

        if (moveIncompleteToBacklog)
        {
            var incompleteCategories = new[] { StateCategory.Unstarted, StateCategory.Started };

            var incompleteCycleIssues = await db.CycleIssues
                .Include(ci => ci.Issue)
                    .ThenInclude(i => i.State)
                .Where(ci => ci.CycleId == cycleId && incompleteCategories.Contains(ci.Issue.State.Category))
                .ToListAsync(ct);

            foreach (var ci in incompleteCycleIssues)
            {
                ci.IsDeleted = true;
                ci.DeletedAt = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync(ct);

        var result = MapToDto(cycle);
        await EnrichCyclesAsync(new[] { result }, ct);
        return result;
    }

    private static CycleDto MapToDto(Cycle cycle) => new()
    {
        Id = cycle.Id,
        Name = cycle.Name,
        Description = cycle.Description,
        Status = cycle.Status,
        StartDate = cycle.StartDate,
        EndDate = cycle.EndDate,
        ProjectId = cycle.ProjectId,
        OwnerId = cycle.OwnerId,
        LeadId = cycle.LeadId,
        LeadName = cycle.Lead != null ? BuildDisplayName(cycle.Lead) : null,
        IssueCount = cycle.CycleIssues.Count,
        IsArchived = cycle.IsArchived,
        ArchivedAt = cycle.ArchivedAt,
        ClosedAt = cycle.ClosedAt,
        CreatedAt = cycle.CreatedAt
    };

    private async Task EnrichCyclesAsync(IReadOnlyList<CycleDto> cycles, CancellationToken ct)
    {
        if (cycles.Count == 0) return;

        var ids = cycles.Select(c => c.Id).ToList();

        // Issue stats per cycle.
        var stats = await db.CycleIssues
            .AsNoTracking()
            .Where(ci => ids.Contains(ci.CycleId))
            .GroupBy(ci => ci.CycleId)
            .Select(g => new
            {
                CycleId = g.Key,
                Total = g.Count(),
                Completed = g.Count(ci => ci.Issue.State.Category == StateCategory.Completed
                                           || ci.Issue.State.Category == StateCategory.Cancelled)
            })
            .ToListAsync(ct);

        // Derive members from assignees of issues belonging to each cycle.
        var assigneeRows = await db.CycleIssues
            .AsNoTracking()
            .Where(ci => ids.Contains(ci.CycleId))
            .SelectMany(ci => ci.Issue.Assignees
                .Where(a => a.User != null)
                .Select(a => new
                {
                    ci.CycleId,
                    a.UserId,
                    DisplayName = a.User.DisplayName,
                    FirstName = a.User.FirstName,
                    LastName = a.User.LastName,
                    UserName = a.User.UserName,
                    Email = a.User.Email,
                    AvatarUrl = a.User.AvatarUrl
                }))
            .ToListAsync(ct);

        var membersByCycle = assigneeRows
            .GroupBy(r => r.CycleId)
            .ToDictionary(g => g.Key, g => g
                .GroupBy(r => r.UserId)
                .Select(ug =>
                {
                    var first = ug.First();
                    var displayName = !string.IsNullOrWhiteSpace(first.DisplayName)
                        ? first.DisplayName!
                        : $"{first.FirstName} {first.LastName}".Trim();
                    if (string.IsNullOrWhiteSpace(displayName))
                        displayName = first.UserName ?? first.Email ?? string.Empty;

                    return new CycleMemberSummaryDto
                    {
                        UserId = first.UserId,
                        DisplayName = displayName,
                        Initials = BuildInitials(displayName),
                        AvatarUrl = first.AvatarUrl
                    };
                })
                .Take(6)
                .ToList());

        var now = DateTime.UtcNow;
        var cycleDates = await db.Cycles
            .AsNoTracking()
            .Where(c => ids.Contains(c.Id))
            .Select(c => new { c.Id, c.StartDate, c.Status })
            .ToListAsync(ct);

        foreach (var dto in cycles)
        {
            var s = stats.FirstOrDefault(x => x.CycleId == dto.Id);
            dto.TotalIssues = s?.Total ?? dto.IssueCount;
            dto.CompletedIssues = s?.Completed ?? 0;

            dto.Members = membersByCycle.TryGetValue(dto.Id, out var m) ? m : [];

            // Velocity = completed issues per day since StartDate.
            var dates = cycleDates.FirstOrDefault(x => x.Id == dto.Id);
            if (dates != null && dates.StartDate.HasValue && dto.CompletedIssues > 0)
            {
                var endpoint = dto.EndDate.HasValue && dto.EndDate.Value < now
                    ? dto.EndDate.Value
                    : now;
                var elapsedDays = Math.Max(1, (endpoint - dates.StartDate.Value).TotalDays);
                dto.Velocity = Math.Round((decimal)(dto.CompletedIssues / elapsedDays), 2);
            }
            else
            {
                dto.Velocity = null;
            }
        }
    }

    private static string BuildDisplayName(User user)
    {
        if (!string.IsNullOrWhiteSpace(user.DisplayName)) return user.DisplayName!;
        var composed = $"{user.FirstName} {user.LastName}".Trim();
        if (!string.IsNullOrWhiteSpace(composed)) return composed;
        return user.UserName ?? user.Email ?? string.Empty;
    }

    private static string BuildInitials(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return string.Empty;
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return string.Empty;
        if (parts.Length == 1) return parts[0][..Math.Min(2, parts[0].Length)].ToUpperInvariant();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpperInvariant();
    }
}
