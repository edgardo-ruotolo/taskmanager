using Microsoft.EntityFrameworkCore;
using Npgsql;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueArchiveService(AppDbContext db, IConfiguration configuration) : IIssueArchiveService
{
    public async Task<IReadOnlyList<IssueDto>> GetArchivedAsync(string workspaceSlug, Guid companyId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var issues = await db.Issues
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(i => i.State)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Include(i => i.CycleIssues)
            .Include(i => i.ModuleIssues)
            .Where(i => i.IsArchived && !i.IsDeleted && i.CompanyId == companyId && i.Company.WorkspaceId == workspace.Id)
            .OrderByDescending(i => i.ArchivedAt)
            .ToListAsync(ct);

        return issues.Select(IssueMapper.MapToDto).ToList();
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

    public async Task BulkUpdateAsync(string workspaceSlug, Guid companyId, List<Guid> issueIds, BulkUpdateIssueDto dto, Guid currentUserId, CancellationToken ct = default)
    {
        var issues = await db.Issues
            .Where(i => issueIds.Contains(i.Id) && i.CompanyId == companyId)
            .ToListAsync(ct);

        CompanyMember? member = null;
        if (dto.StateId is not null)
            member = await db.CompanyMembers.FirstOrDefaultAsync(m => m.UserId == currentUserId && m.CompanyId == companyId, ct);

        foreach (var issue in issues)
        {
            if (dto.StateId is not null)
            {
                if (issue.RequiresAdminApproval && issue.ApprovalRequiredStateIds.Contains(dto.StateId.Value))
                {
                    if (member == null || (member.Role != CompanyRole.Admin && member.Role != CompanyRole.Lead))
                        throw new ForbiddenException($"Issue '{issue.Title}' requires Admin or Lead approval to move to this state.");

                    issue.ApprovedById = currentUserId;
                    issue.ApprovedAt = DateTime.UtcNow;
                }
                issue.StateId = dto.StateId.Value;
            }
            if (dto.Priority is not null) issue.Priority = dto.Priority.Value;
            if (dto.DueDate is not null) issue.DueDate = DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc);
        }

        await db.SaveChangesAsync(ct);
    }

    public async Task<IssueDto> DuplicateAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid currentUserId, CancellationToken ct = default)
    {
        var original = await db.Issues
            .Include(i => i.Labels)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId, ct)
            ?? throw new NotFoundException("Issue not found.");

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

        var duplicate = new Issue
        {
            Title = original.Title + " (copia)",
            Description = original.Description,
            DescriptionHtml = original.DescriptionHtml,
            DescriptionJson = original.DescriptionJson,
            Priority = original.Priority,
            StateId = original.StateId,
            CompanyId = original.CompanyId,
            CreatedById = currentUserId,
            SequenceId = sequenceId,
            AssigneeId = original.AssigneeId,
            ParentId = original.ParentId,
            IssueTypeId = original.IssueTypeId,
            EstimatePointId = original.EstimatePointId,
            SortOrder = original.SortOrder + 1,
            IsDraft = original.IsDraft,
            StartDate = original.StartDate,
            DueDate = original.DueDate,
            RequiresAdminApproval = original.RequiresAdminApproval,
            ApprovalRequiredStateIds = [.. original.ApprovalRequiredStateIds],
        };

        db.Issues.Add(duplicate);

        if (original.Labels.Count > 0)
        {
            db.IssueLabels.AddRange(original.Labels.Select(l => new IssueLabel { IssueId = duplicate.Id, LabelId = l.LabelId }));
        }

        await db.SaveChangesAsync(ct);

        var created = await db.Issues
            .AsNoTracking()
            .Include(i => i.State)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Include(i => i.CycleIssues)
            .Include(i => i.ModuleIssues)
            .FirstAsync(i => i.Id == duplicate.Id, ct);

        return IssueMapper.MapToDto(created);
    }
}
