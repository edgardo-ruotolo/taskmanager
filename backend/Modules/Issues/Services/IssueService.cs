using Microsoft.EntityFrameworkCore;
using Npgsql;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueService(AppDbContext db, IConfiguration configuration, IIssueActivityService activityService) : IIssueService
{
    public async Task<IssueDto> CreateAsync(string workspaceSlug, Guid companyId, Guid userId, CreateIssueDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        var state = await db.States.FindAsync([dto.StateId], ct)
            ?? throw new NotFoundException($"State {dto.StateId} not found.");

        var connString = configuration.GetConnectionString("Postgres")!;
        int sequenceId;

        await using var conn = new NpgsqlConnection(connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        var lockKey = BitConverter.ToInt64(companyId.ToByteArray(), 0);
        await using (var lockCmd = new NpgsqlCommand($"SELECT pg_advisory_xact_lock({lockKey})", conn, tx))
            await lockCmd.ExecuteNonQueryAsync(ct);

        await using (var seqCmd = new NpgsqlCommand(
            "SELECT COALESCE(MAX(\"SequenceId\"), 0) + 1 FROM \"Issues\" WHERE \"CompanyId\" = @companyId",
            conn, tx))
        {
            seqCmd.Parameters.AddWithValue("companyId", companyId);
            sequenceId = Convert.ToInt32(await seqCmd.ExecuteScalarAsync(ct));
        }

        await tx.CommitAsync(ct);
        await conn.CloseAsync();

        var issue = new Issue
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            StateId = state.Id,
            State = state,
            CompanyId = company.Id,
            Company = company,
            CreatedById = userId,
            SequenceId = sequenceId,
            AssigneeId = dto.AssigneeId,
            ParentId = dto.ParentId,
            DueDate = dto.DueDate
        };

        db.Issues.Add(issue);
        await db.SaveChangesAsync(ct);

        return MapIssueToDto(issue);
    }

    public async Task<PagedResult<IssueDto>> GetAllAsync(string workspaceSlug, Guid companyId, int page, int pageSize, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var query = db.Issues
            .Include(i => i.State)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Where(i => i.CompanyId == companyId && i.Company.WorkspaceId == workspace.Id);

        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(i => i.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<IssueDto>
        {
            Items = items.Select(MapIssueToDto),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<IssueDto> GetByIdAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default)
    {
        var issue = await db.Issues
            .Include(i => i.State)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId, ct)
            ?? throw new NotFoundException("Issue not found.");

        return MapIssueToDto(issue);
    }

    public async Task<IssueDto> UpdateAsync(string workspaceSlug, Guid companyId, Guid issueId, UpdateIssueDto dto, CancellationToken ct = default)
    {
        var issue = await db.Issues
            .Include(i => i.State)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId, ct)
            ?? throw new NotFoundException("Issue not found.");

        var oldStateName = issue.State?.Name;
        var oldPriority = issue.Priority.ToString();
        var oldTitle = issue.Title;

        if (dto.Title is not null) issue.Title = dto.Title;
        if (dto.Description is not null) issue.Description = dto.Description;
        if (dto.Priority is not null) issue.Priority = dto.Priority.Value;
        if (dto.AssigneeId is not null) issue.AssigneeId = dto.AssigneeId;
        if (dto.DueDate is not null) issue.DueDate = dto.DueDate;

        if (dto.StateId is not null)
        {
            var state = await db.States.FindAsync([dto.StateId.Value], ct)
                ?? throw new NotFoundException($"State {dto.StateId} not found.");
            issue.StateId = state.Id;
            issue.State = state;
        }

        await db.SaveChangesAsync(ct);

        // Log activities for changed fields — actor is not available here, use CreatedById as fallback
        var actorId = issue.CreatedById;

        if (dto.StateId is not null && issue.State?.Name != oldStateName)
            await activityService.LogActivityAsync(issue.Id, actorId, "state", oldStateName, issue.State?.Name, ct);

        if (dto.Priority is not null && issue.Priority.ToString() != oldPriority)
            await activityService.LogActivityAsync(issue.Id, actorId, "priority", oldPriority, issue.Priority.ToString(), ct);

        if (dto.Title is not null && issue.Title != oldTitle)
            await activityService.LogActivityAsync(issue.Id, actorId, "name", oldTitle, issue.Title, ct);

        return MapIssueToDto(issue);
    }

    public async Task DeleteAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default)
    {
        var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId, ct)
            ?? throw new NotFoundException("Issue not found.");

        issue.IsDeleted = true;
        issue.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task AddAssigneeAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid userId, CancellationToken ct = default)
    {
        var issue = await db.Issues
            .Include(i => i.Assignees)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId, ct)
            ?? throw new NotFoundException("Issue not found.");

        if (issue.Assignees.Any(a => a.UserId == userId))
            return;

        db.IssueAssignees.Add(new IssueAssignee { IssueId = issueId, UserId = userId });
        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveAssigneeAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid userId, CancellationToken ct = default)
    {
        var assignee = await db.IssueAssignees
            .FirstOrDefaultAsync(a => a.IssueId == issueId && a.UserId == userId, ct)
            ?? throw new NotFoundException("Assignee not found on this issue.");

        db.IssueAssignees.Remove(assignee);
        await db.SaveChangesAsync(ct);
    }

    public async Task AddLabelAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid labelId, CancellationToken ct = default)
    {
        var issue = await db.Issues
            .Include(i => i.Labels)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId, ct)
            ?? throw new NotFoundException("Issue not found.");

        if (issue.Labels.Any(l => l.LabelId == labelId))
            return;

        db.IssueLabels.Add(new IssueLabel { IssueId = issueId, LabelId = labelId });
        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveLabelAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid labelId, CancellationToken ct = default)
    {
        var label = await db.IssueLabels
            .FirstOrDefaultAsync(l => l.IssueId == issueId && l.LabelId == labelId, ct)
            ?? throw new NotFoundException("Label not found on this issue.");

        db.IssueLabels.Remove(label);
        await db.SaveChangesAsync(ct);
    }

    public async Task<List<IssueDto>> GetArchivedAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        return await db.Issues
            .IgnoreQueryFilters()
            .Include(i => i.State)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Where(i => i.IsArchived && !i.IsDeleted && i.CompanyId == companyId && i.Company.WorkspaceId == workspace.Id)
            .OrderByDescending(i => i.ArchivedAt)
            .Select(i => MapIssueToDto(i))
            .ToListAsync(ct);
    }

    public async Task ArchiveAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default)
    {
        var issue = await db.Issues
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId && !i.IsDeleted, ct)
            ?? throw new NotFoundException("Issue not found.");

        issue.IsArchived = true;
        issue.ArchivedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task UnarchiveAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default)
    {
        var issue = await db.Issues
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId && !i.IsDeleted, ct)
            ?? throw new NotFoundException("Issue not found.");

        issue.IsArchived = false;
        issue.ArchivedAt = null;
        await db.SaveChangesAsync(ct);
    }

    public async Task BulkArchiveAsync(string workspaceSlug, Guid companyId, List<Guid> issueIds, CancellationToken ct = default)
    {
        var issues = await db.Issues
            .IgnoreQueryFilters()
            .Where(i => issueIds.Contains(i.Id) && i.CompanyId == companyId && !i.IsDeleted)
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        foreach (var issue in issues)
        {
            issue.IsArchived = true;
            issue.ArchivedAt = now;
        }

        await db.SaveChangesAsync(ct);
    }

    public async Task BulkDeleteAsync(string workspaceSlug, Guid companyId, List<Guid> issueIds, CancellationToken ct = default)
    {
        var issues = await db.Issues
            .IgnoreQueryFilters()
            .Where(i => issueIds.Contains(i.Id) && i.CompanyId == companyId && !i.IsDeleted)
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        foreach (var issue in issues)
        {
            issue.IsDeleted = true;
            issue.DeletedAt = now;
        }

        await db.SaveChangesAsync(ct);
    }

    public async Task BulkUpdateAsync(string workspaceSlug, Guid companyId, List<Guid> issueIds, BulkUpdateIssueDto dto, CancellationToken ct = default)
    {
        var issues = await db.Issues
            .Where(i => issueIds.Contains(i.Id) && i.CompanyId == companyId)
            .ToListAsync(ct);

        foreach (var issue in issues)
        {
            if (dto.StateId is not null) issue.StateId = dto.StateId.Value;
            if (dto.Priority is not null) issue.Priority = dto.Priority.Value;
            if (dto.DueDate is not null) issue.DueDate = dto.DueDate;
        }

        await db.SaveChangesAsync(ct);
    }

    private static IssueDto MapIssueToDto(Issue issue) => new()
    {
        Id = issue.Id,
        SequenceId = issue.SequenceId,
        Title = issue.Title,
        Description = issue.Description,
        Priority = issue.Priority,
        CompanyId = issue.CompanyId,
        StateId = issue.StateId,
        StateName = issue.State?.Name ?? string.Empty,
        StateColor = issue.State?.Color ?? string.Empty,
        StateGroup = issue.State?.Category.ToString(),
        CreatedById = issue.CreatedById,
        AssigneeId = issue.AssigneeId,
        AssigneeIds = issue.Assignees.Select(a => a.UserId).ToList(),
        LabelIds = issue.Labels.Select(l => l.LabelId).ToList(),
        ParentId = issue.ParentId,
        DueDate = issue.DueDate,
        IsArchived = issue.IsArchived,
        ArchivedAt = issue.ArchivedAt,
        CreatedAt = issue.CreatedAt,
        UpdatedAt = issue.UpdatedAt
    };
}
