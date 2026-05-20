using Ganss.Xss;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.Cycles.Entities;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.ProjectModules.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueService(AppDbContext db, IIssueActivityService activityService, IHtmlSanitizer htmlSanitizer) : IIssueService
{
    private string? Sanitize(string? html) =>
        string.IsNullOrEmpty(html) ? html : htmlSanitizer.Sanitize(html);

    public async Task<IssueDto> CreateAsync(string workspaceSlug, Guid companyId, Guid userId, CreateIssueDto dto, CancellationToken ct = default)
    {
        // Reads — no tracking needed for validation.
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var company = await db.Companies.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == companyId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Company not found.");

        var state = await db.States.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == dto.StateId, ct)
            ?? throw new NotFoundException($"State {dto.StateId} not found.");

        // Single EF transaction encloses the SequenceId reservation + Issue insertion +
        // all side-effects (assignees, labels, cycle/module attachments) so a failure in
        // any step rolls back the whole operation. We use the shared AppDbContext
        // connection so pg_advisory_xact_lock and the INSERT live in the same backend session.
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var lockKey = BitConverter.ToInt64(companyId.ToByteArray(), 0);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock({lockKey})", ct);

        var maxSeq = await db.Issues
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(i => i.CompanyId == companyId)
            .Select(i => (int?)i.SequenceId)
            .MaxAsync(ct) ?? 0;
        var sequenceId = maxSeq + 1;

        var issue = new Issue
        {
            Title = dto.Title,
            Description = dto.Description,
            DescriptionHtml = Sanitize(dto.DescriptionHtml),
            DescriptionJson = dto.DescriptionJson,
            Priority = dto.Priority,
            StateId = state.Id,
            CompanyId = company.Id,
            CreatedById = userId,
            SequenceId = sequenceId,
            AssigneeId = dto.AssigneeId,
            ParentId = dto.ParentId,
            IssueTypeId = dto.IssueTypeId,
            EstimatePointId = dto.EstimatePointId,
            SortOrder = dto.SortOrder,
            IsDraft = dto.IsDraft,
            StartDate = dto.StartDate.HasValue ? DateTime.SpecifyKind(dto.StartDate.Value, DateTimeKind.Utc) : null,
            DueDate = dto.DueDate.HasValue ? DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc) : null
        };

        db.Issues.Add(issue);

        if (dto.AssigneeIds.Count > 0)
        {
            db.IssueAssignees.AddRange(dto.AssigneeIds.Distinct()
                .Select(uid => new IssueAssignee { IssueId = issue.Id, UserId = uid }));
        }

        if (dto.LabelIds.Count > 0)
        {
            db.IssueLabels.AddRange(dto.LabelIds.Distinct()
                .Select(lid => new IssueLabel { IssueId = issue.Id, LabelId = lid }));
        }

        if (dto.CycleId.HasValue)
        {
            db.CycleIssues.Add(new CycleIssue { CycleId = dto.CycleId.Value, IssueId = issue.Id, AddedById = userId });
        }

        if (dto.ModuleIds.Count > 0)
        {
            db.ModuleIssues.AddRange(dto.ModuleIds.Distinct()
                .Select(mid => new ModuleIssue { ModuleId = mid, IssueId = issue.Id, AddedById = userId }));
        }

        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        // Re-load with full graph for the response DTO.
        var created = await db.Issues
            .AsNoTracking()
            .Include(i => i.State)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Include(i => i.CycleIssues)
            .Include(i => i.ModuleIssues)
            .FirstAsync(i => i.Id == issue.Id, ct);

        return IssueMapper.MapToDto(created);
    }

    public async Task<PagedResult<IssueDto>> GetAllAsync(string workspaceSlug, Guid companyId, int page, int pageSize, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        // Server-side projection eliminates the 5 Includes that the list view used to require.
        // EF translates the join+aggregations directly to SQL, returning only the fields the
        // DTO needs. This trims payload size and avoids materializing the full entity graph.
        var query = db.Issues
            .AsNoTracking()
            .Where(i => i.CompanyId == companyId && i.Company.WorkspaceId == workspace.Id);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(i => i.SortOrder)
            .ThenByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new IssueDto
            {
                Id = i.Id,
                SequenceId = i.SequenceId,
                Title = i.Title,
                Description = i.Description,
                DescriptionHtml = i.DescriptionHtml,
                DescriptionJson = i.DescriptionJson,
                Priority = i.Priority,
                CompanyId = i.CompanyId,
                StateId = i.StateId,
                StateName = i.State!.Name,
                StateColor = i.State.Color,
                StateGroup = i.State.Category.ToString(),
                CreatedById = i.CreatedById,
                UpdatedById = i.UpdatedById,
                AssigneeId = i.AssigneeId,
                AssigneeIds = i.Assignees.Select(a => a.UserId).ToList(),
                LabelIds = i.Labels.Select(l => l.LabelId).ToList(),
                ModuleIds = i.ModuleIssues.Select(mi => mi.ModuleId).ToList(),
                CycleId = i.CycleIssues.Select(ci => (Guid?)ci.CycleId).FirstOrDefault(),
                ParentId = i.ParentId,
                IssueTypeId = i.IssueTypeId,
                EstimatePointId = i.EstimatePointId,
                Point = i.Point,
                StartDate = i.StartDate,
                DueDate = i.DueDate,
                CompletedAt = i.CompletedAt,
                SortOrder = i.SortOrder,
                IsDraft = i.IsDraft,
                IsArchived = i.IsArchived,
                ArchivedAt = i.ArchivedAt,
                ExternalSource = i.ExternalSource,
                ExternalId = i.ExternalId,
                RequiresAdminApproval = i.RequiresAdminApproval,
                ApprovalRequiredStateIds = i.ApprovalRequiredStateIds,
                ApprovedById = i.ApprovedById,
                ApprovedAt = i.ApprovedAt,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<IssueDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<IssueDto> GetByIdAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default)
    {
        // Detail view needs the full graph for back-references; AsNoTracking is still safe
        // because we never persist the loaded entity from this read path.
        var issue = await db.Issues
            .AsNoTracking()
            .Include(i => i.State)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Include(i => i.CycleIssues)
            .Include(i => i.ModuleIssues)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId, ct)
            ?? throw new NotFoundException("Issue not found.");

        return IssueMapper.MapToDto(issue);
    }

    public async Task<IssueDto> UpdateAsync(string workspaceSlug, Guid companyId, Guid issueId, UpdateIssueDto dto, Guid currentUserId, CancellationToken ct = default)
    {
        var issue = await db.Issues
            .Include(i => i.State)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Include(i => i.CycleIssues)
            .Include(i => i.ModuleIssues)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId, ct)
            ?? throw new NotFoundException("Issue not found.");

        var oldStateName = issue.State?.Name;
        var oldPriority = issue.Priority.ToString();
        var oldTitle = issue.Title;

        if (dto.Title is not null) issue.Title = dto.Title;
        if (dto.Description is not null) issue.Description = dto.Description;
        if (dto.DescriptionHtml is not null) issue.DescriptionHtml = Sanitize(dto.DescriptionHtml);
        if (dto.DescriptionJson is not null) issue.DescriptionJson = dto.DescriptionJson;
        if (dto.Priority is not null) issue.Priority = dto.Priority.Value;
        if (dto.AssigneeId is not null) issue.AssigneeId = dto.AssigneeId;
        if (dto.ParentId is not null) issue.ParentId = dto.ParentId;
        if (dto.IssueTypeId is not null) issue.IssueTypeId = dto.IssueTypeId;
        if (dto.EstimatePointId is not null) issue.EstimatePointId = dto.EstimatePointId;
        if (dto.SortOrder.HasValue) issue.SortOrder = dto.SortOrder.Value;
        if (dto.IsDraft.HasValue) issue.IsDraft = dto.IsDraft.Value;
        if (dto.RequiresAdminApproval.HasValue) issue.RequiresAdminApproval = dto.RequiresAdminApproval.Value;
        if (dto.ApprovalRequiredStateIds is not null) issue.ApprovalRequiredStateIds = dto.ApprovalRequiredStateIds;
        if (dto.StartDate is not null) issue.StartDate = DateTime.SpecifyKind(dto.StartDate.Value, DateTimeKind.Utc);
        if (dto.DueDate is not null) issue.DueDate = DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc);

        if (dto.StateId is not null)
        {
            if (issue.RequiresAdminApproval && issue.ApprovalRequiredStateIds.Contains(dto.StateId.Value))
            {
                var member = await db.CompanyMembers
                    .FirstOrDefaultAsync(m => m.UserId == currentUserId && m.CompanyId == issue.CompanyId, ct);

                if (member == null || (member.Role != CompanyRole.Admin && member.Role != CompanyRole.Lead))
                    throw new ForbiddenException("Esta tarea requiere aprobación de Admin o Lead para moverse a este estado.");

                issue.ApprovedById = currentUserId;
                issue.ApprovedAt = DateTime.UtcNow;
            }

            var state = await db.States.FindAsync([dto.StateId.Value], ct)
                ?? throw new NotFoundException($"State {dto.StateId} not found.");
            issue.StateId = state.Id;
            issue.State = state;

            issue.CompletedAt = state.Category == StateCategory.Completed
                ? (issue.CompletedAt ?? DateTime.UtcNow)
                : null;
        }

        if (dto.AssigneeIds is not null)
        {
            var incoming = dto.AssigneeIds.Distinct().ToHashSet();
            var current = issue.Assignees.Select(a => a.UserId).ToHashSet();
            var toRemove = issue.Assignees.Where(a => !incoming.Contains(a.UserId)).ToList();
            var toAdd = incoming.Where(uid => !current.Contains(uid)).ToList();
            db.IssueAssignees.RemoveRange(toRemove);
            db.IssueAssignees.AddRange(toAdd.Select(uid => new IssueAssignee { IssueId = issue.Id, UserId = uid }));
        }

        if (dto.LabelIds is not null)
        {
            var incoming = dto.LabelIds.Distinct().ToHashSet();
            var current = issue.Labels.Select(l => l.LabelId).ToHashSet();
            var toRemove = issue.Labels.Where(l => !incoming.Contains(l.LabelId)).ToList();
            var toAdd = incoming.Where(lid => !current.Contains(lid)).ToList();
            db.IssueLabels.RemoveRange(toRemove);
            db.IssueLabels.AddRange(toAdd.Select(lid => new IssueLabel { IssueId = issue.Id, LabelId = lid }));
        }

        if (dto.CycleId is not null)
        {
            var existingCycle = await db.CycleIssues.FirstOrDefaultAsync(ci => ci.IssueId == issue.Id, ct);
            if (existingCycle != null && existingCycle.CycleId != dto.CycleId.Value)
            {
                db.CycleIssues.Remove(existingCycle);
                db.CycleIssues.Add(new CycleIssue { CycleId = dto.CycleId.Value, IssueId = issue.Id, AddedById = issue.CreatedById });
            }
            else if (existingCycle == null)
            {
                db.CycleIssues.Add(new CycleIssue { CycleId = dto.CycleId.Value, IssueId = issue.Id, AddedById = issue.CreatedById });
            }
        }

        if (dto.ModuleIds is not null)
        {
            var incoming = dto.ModuleIds.Distinct().ToHashSet();
            var existing = await db.ModuleIssues.Where(mi => mi.IssueId == issue.Id).ToListAsync(ct);
            var existingIds = existing.Select(mi => mi.ModuleId).ToHashSet();
            var toRemove = existing.Where(mi => !incoming.Contains(mi.ModuleId)).ToList();
            var toAdd = incoming.Where(mid => !existingIds.Contains(mid)).ToList();
            db.ModuleIssues.RemoveRange(toRemove);
            db.ModuleIssues.AddRange(toAdd.Select(mid => new ModuleIssue { ModuleId = mid, IssueId = issue.Id, AddedById = issue.CreatedById }));
        }

        await db.SaveChangesAsync(ct);

        var actorId = currentUserId;

        if (dto.StateId is not null && issue.State?.Name != oldStateName)
            await activityService.LogActivityAsync(issue.Id, actorId, "state", oldStateName, issue.State?.Name, ct);

        if (dto.Priority is not null && issue.Priority.ToString() != oldPriority)
            await activityService.LogActivityAsync(issue.Id, actorId, "priority", oldPriority, issue.Priority.ToString(), ct);

        if (dto.Title is not null && issue.Title != oldTitle)
            await activityService.LogActivityAsync(issue.Id, actorId, "name", oldTitle, issue.Title, ct);

        return IssueMapper.MapToDto(issue);
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

    public async Task AttachCycleAsync(Guid companyId, Guid issueId, Guid cycleId, Guid userId, CancellationToken ct = default)
    {
        var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId, ct)
            ?? throw new NotFoundException("Issue not found.");

        var existing = await db.CycleIssues.FirstOrDefaultAsync(ci => ci.IssueId == issueId, ct);
        if (existing != null)
        {
            if (existing.CycleId == cycleId) return;
            db.CycleIssues.Remove(existing);
        }

        db.CycleIssues.Add(new CycleIssue { CycleId = cycleId, IssueId = issueId, AddedById = userId });
        await db.SaveChangesAsync(ct);
    }

    public async Task DetachCycleAsync(Guid companyId, Guid issueId, CancellationToken ct = default)
    {
        var existing = await db.CycleIssues.FirstOrDefaultAsync(ci => ci.IssueId == issueId, ct);
        if (existing == null) return;
        db.CycleIssues.Remove(existing);
        await db.SaveChangesAsync(ct);
    }

    public async Task AttachModulesAsync(Guid companyId, Guid issueId, List<Guid> moduleIds, Guid userId, CancellationToken ct = default)
    {
        var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId, ct)
            ?? throw new NotFoundException("Issue not found.");

        var incoming = moduleIds.Distinct().ToHashSet();
        var existing = await db.ModuleIssues.Where(mi => mi.IssueId == issueId).ToListAsync(ct);
        var toAdd = incoming.Where(mid => !existing.Any(mi => mi.ModuleId == mid)).ToList();

        db.ModuleIssues.AddRange(toAdd.Select(mid => new ModuleIssue { ModuleId = mid, IssueId = issueId, AddedById = userId }));
        await db.SaveChangesAsync(ct);
    }

    public async Task DetachModuleAsync(Guid companyId, Guid issueId, Guid moduleId, CancellationToken ct = default)
    {
        var existing = await db.ModuleIssues.FirstOrDefaultAsync(mi => mi.IssueId == issueId && mi.ModuleId == moduleId, ct)
            ?? throw new NotFoundException("Module not attached to this issue.");
        db.ModuleIssues.Remove(existing);
        await db.SaveChangesAsync(ct);
    }

    public async Task<List<IssueDto>> SearchSimilarAsync(string workspaceSlug, Guid companyId, string title, double threshold = 0.3, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        return await db.Issues
            .AsNoTracking()
            .Include(i => i.State)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Include(i => i.CycleIssues)
            .Include(i => i.ModuleIssues)
            .Where(i => i.CompanyId == companyId && i.Company.WorkspaceId == workspace.Id)
            .Where(i => EF.Functions.TrigramsSimilarity(i.Title, title) >= threshold)
            .OrderByDescending(i => EF.Functions.TrigramsSimilarity(i.Title, title))
            .Take(10)
            .Select(i => IssueMapper.MapToDto(i))
            .ToListAsync(ct);
    }

}
