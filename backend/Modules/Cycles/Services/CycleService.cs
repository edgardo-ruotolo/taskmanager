using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Cycles.Dtos;
using TaskManager.Api.Modules.Cycles.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Cycles.Services;

public class CycleService(AppDbContext db) : ICycleService
{
    public async Task<PagedResult<CycleDto>> GetAllAsync(string workspaceSlug, Guid companyId, int page, int pageSize, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var query = db.Cycles
            .AsNoTracking()
            .Include(c => c.CycleIssues)
            .Where(c => c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<CycleDto>
        {
            Items = items.Select(MapToDto),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CycleDto> GetByIdAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .AsNoTracking()
            .Include(c => c.CycleIssues)
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        return MapToDto(cycle);
    }

    public async Task<CycleDto> CreateAsync(string workspaceSlug, Guid companyId, Guid userId, CreateCycleDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        var cycle = new Cycle
        {
            Name = dto.Name,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            CompanyId = company.Id,
            OwnerId = userId
        };

        db.Cycles.Add(cycle);
        await db.SaveChangesAsync(ct);

        return MapToDto(cycle);
    }

    public async Task<CycleDto> UpdateAsync(string workspaceSlug, Guid companyId, Guid cycleId, UpdateCycleDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .Include(c => c.CycleIssues)
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        if (dto.Name is not null) cycle.Name = dto.Name;
        if (dto.Description is not null) cycle.Description = dto.Description;
        if (dto.Status is not null) cycle.Status = dto.Status.Value;
        if (dto.StartDate is not null) cycle.StartDate = dto.StartDate;
        if (dto.EndDate is not null) cycle.EndDate = dto.EndDate;

        await db.SaveChangesAsync(ct);
        return MapToDto(cycle);
    }

    public async Task DeleteAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        cycle.IsDeleted = true;
        cycle.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task AddIssueAsync(string workspaceSlug, Guid companyId, Guid cycleId, Guid issueId, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id, ct)
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

    public async Task RemoveIssueAsync(string workspaceSlug, Guid companyId, Guid cycleId, Guid issueId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Cycles
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Cycle not found.");

        var cycleIssue = await db.CycleIssues
            .FirstOrDefaultAsync(ci => ci.CycleId == cycleId && ci.IssueId == issueId, ct)
            ?? throw new NotFoundException("Issue not found in this cycle.");

        cycleIssue.IsDeleted = true;
        cycleIssue.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<List<CycleDto>> GetArchivedAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        return await db.Cycles
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Include(c => c.CycleIssues)
            .Where(c => c.IsArchived && !c.IsDeleted && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id)
            .OrderByDescending(c => c.ArchivedAt)
            .Select(c => MapToDto(c))
            .ToListAsync(ct);
    }

    public async Task ArchiveAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id && !c.IsDeleted, ct)
            ?? throw new NotFoundException("Cycle not found.");

        cycle.IsArchived = true;
        cycle.ArchivedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task UnarchiveAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var cycle = await db.Cycles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id && !c.IsDeleted, ct)
            ?? throw new NotFoundException("Cycle not found.");

        cycle.IsArchived = false;
        cycle.ArchivedAt = null;
        await db.SaveChangesAsync(ct);
    }

    public async Task TransferIssuesAsync(string workspaceSlug, Guid companyId, Guid sourceCycleId, Guid targetCycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Cycles
            .FirstOrDefaultAsync(c => c.Id == sourceCycleId && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Source cycle not found.");

        _ = await db.Cycles
            .FirstOrDefaultAsync(c => c.Id == targetCycleId && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id, ct)
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

    public async Task<CycleProgressDto> GetProgressAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Cycles.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id, ct)
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

    public async Task<CycleAnalyticsDto> GetAnalyticsAsync(string workspaceSlug, Guid companyId, Guid cycleId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Cycles.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == cycleId && c.CompanyId == companyId && c.Company.WorkspaceId == workspace.Id, ct)
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

    private static CycleDto MapToDto(Cycle cycle) => new()
    {
        Id = cycle.Id,
        Name = cycle.Name,
        Description = cycle.Description,
        Status = cycle.Status,
        StartDate = cycle.StartDate,
        EndDate = cycle.EndDate,
        CompanyId = cycle.CompanyId,
        OwnerId = cycle.OwnerId,
        IssueCount = cycle.CycleIssues.Count,
        IsArchived = cycle.IsArchived,
        ArchivedAt = cycle.ArchivedAt,
        CreatedAt = cycle.CreatedAt
    };
}
