using System.Text.Json;
using System.Text.RegularExpressions;
using Ganss.Xss;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskManager.Api.Common.Auth;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Projects.Entities;
using TaskManager.Api.Modules.Cycles.Entities;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.Modules.Entities;
using TaskManager.Api.Modules.Realtime;
using TaskManager.Api.Modules.Realtime.Contracts;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueService(
    AppDbContext db,
    IIssueActivityService activityService,
    IHtmlSanitizer htmlSanitizer,
    ICurrentUser currentUser,
    IRealtimePublisher realtime,
    ILogger<IssueService> logger) : IIssueService
{
    private static readonly Regex HtmlTagRegex = new("<[^>]+>", RegexOptions.Compiled);
    private static readonly Regex WhitespaceRegex = new("\\s+", RegexOptions.Compiled);

    private string? Sanitize(string? html) =>
        string.IsNullOrEmpty(html) ? html : htmlSanitizer.Sanitize(html);

    private static string? ExtractPlainTextFromTiptapJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            using var doc = JsonDocument.Parse(json);
            var sb = new System.Text.StringBuilder();
            AppendNodeText(doc.RootElement, sb);
            var text = sb.ToString().Trim();
            return string.IsNullOrEmpty(text) ? null : text;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static void AppendNodeText(JsonElement node, System.Text.StringBuilder sb)
    {
        if (node.ValueKind == JsonValueKind.Object)
        {
            if (node.TryGetProperty("type", out var typeProp) && typeProp.ValueKind == JsonValueKind.String)
            {
                var type = typeProp.GetString();
                if (type == "text" && node.TryGetProperty("text", out var textProp) && textProp.ValueKind == JsonValueKind.String)
                {
                    sb.Append(textProp.GetString());
                }
                else if (type == "hardBreak" || type == "lineBreak")
                {
                    sb.Append('\n');
                }
            }
            if (node.TryGetProperty("content", out var content) && content.ValueKind == JsonValueKind.Array)
            {
                foreach (var child in content.EnumerateArray())
                    AppendNodeText(child, sb);
                if (node.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String)
                {
                    var type = t.GetString();
                    if (type is "paragraph" or "heading" or "listItem" or "blockquote") sb.Append('\n');
                }
            }
        }
        else if (node.ValueKind == JsonValueKind.Array)
        {
            foreach (var child in node.EnumerateArray())
                AppendNodeText(child, sb);
        }
    }

    private static string? StripHtmlToPlain(string? html)
    {
        if (string.IsNullOrWhiteSpace(html)) return null;
        var stripped = HtmlTagRegex.Replace(html, " ");
        var decoded = System.Net.WebUtility.HtmlDecode(stripped);
        var collapsed = WhitespaceRegex.Replace(decoded, " ").Trim();
        return string.IsNullOrEmpty(collapsed) ? null : collapsed;
    }

    private static string? ComputePlainDescription(string? descriptionJson, string? descriptionHtml, string? fallbackPlain) =>
        ExtractPlainTextFromTiptapJson(descriptionJson)
        ?? StripHtmlToPlain(descriptionHtml)
        ?? (string.IsNullOrWhiteSpace(fallbackPlain) ? null : fallbackPlain);

    private async Task EmitIssueEventAsync(string type, string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct)
    {
        var evt = new RealtimeEvent(type, workspaceSlug, projectId, issueId, currentUser.UserId, DateTimeOffset.UtcNow);
        await realtime.PublishToProjectAsync(projectId, evt, ct);
        await realtime.PublishToIssueAsync(issueId, evt, ct);
    }

    private async Task<bool> CanApproveAsync(Guid userId, Guid projectId, CancellationToken ct)
    {
        if (currentUser.IsSuperAdmin) return true;
        var member = await db.ProjectMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.UserId == userId && m.ProjectId == projectId, ct);
        return member is not null && (member.Role == ProjectRole.Admin || member.Role == ProjectRole.Lead);
    }

    public async Task<IssueDto> CreateAsync(string workspaceSlug, Guid projectId, Guid userId, CreateIssueDto dto, CancellationToken ct = default)
    {
        // Reads — no tracking needed for validation.
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var project = await db.Projects.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == projectId && c.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Project not found.");

        var state = await db.States.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == dto.StateId, ct)
            ?? throw new NotFoundException($"State {dto.StateId} not found.");

        // Single EF transaction encloses the SequenceId reservation + Issue insertion +
        // all side-effects (assignees, labels, cycle/module attachments) so a failure in
        // any step rolls back the whole operation. We use the shared AppDbContext
        // connection so pg_advisory_xact_lock and the INSERT live in the same backend session.
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var lockKey = BitConverter.ToInt64(projectId.ToByteArray(), 0);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock({lockKey})", ct);

        var maxSeq = await db.Issues
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(i => i.ProjectId == projectId)
            .Select(i => (int?)i.SequenceId)
            .MaxAsync(ct) ?? 0;
        var sequenceId = maxSeq + 1;

        var sanitizedHtml = Sanitize(dto.DescriptionHtml);
        var issue = new Issue
        {
            Title = dto.Title,
            Description = ComputePlainDescription(dto.DescriptionJson, sanitizedHtml, dto.Description),
            DescriptionHtml = sanitizedHtml,
            DescriptionJson = dto.DescriptionJson,
            Priority = dto.Priority,
            StateId = state.Id,
            ProjectId = project.Id,
            CreatedById = userId,
            SequenceId = sequenceId,
            AssigneeId = dto.AssigneeId,
            ParentId = dto.ParentId,
            IssueTypeId = dto.IssueTypeId,
            SortOrder = dto.SortOrder,
            IsDraft = dto.IsDraft,
            StartDate = dto.StartDate.HasValue ? DateTime.SpecifyKind(dto.StartDate.Value, DateTimeKind.Utc) : null,
            DueDate = dto.DueDate.HasValue ? DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc) : null,
            RequiresAdminApproval = dto.RequiresAdminApproval,
            ApprovalRequiredStateIds = dto.ApprovalRequiredStateIds
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

        await EmitIssueEventAsync("issue.created", workspaceSlug, project.Id, issue.Id, ct);

        // Re-load with full graph for the response DTO.
        var created = await db.Issues
            .AsNoTracking()
            .Include(i => i.State)
            .Include(i => i.Assignee)
            .Include(i => i.CreatedBy)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Include(i => i.CycleIssues).ThenInclude(ci => ci.Cycle)
            .Include(i => i.ModuleIssues)
            .Include(i => i.SubIssues).ThenInclude(s => s.State)
            .FirstAsync(i => i.Id == issue.Id, ct);

        return IssueMapper.MapToDto(created);
    }

    public async Task<PagedResult<IssueDto>> GetAllAsync(string workspaceSlug, Guid projectId, int page, int pageSize, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        // Server-side projection eliminates the 5 Includes that the list view used to require.
        // EF translates the join+aggregations directly to SQL, returning only the fields the
        // DTO needs. This trims payload size and avoids materializing the full entity graph.
        var query = db.Issues
            .AsNoTracking()
            .Where(i => i.ProjectId == projectId && i.Project.WorkspaceId == workspace.Id);

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
                ProjectId = i.ProjectId,
                StateId = i.StateId,
                StateName = i.State!.Name,
                StateColor = i.State.Color,
                StateGroup = i.State.Category.ToString(),
                CreatedById = i.CreatedById,
                CreatedByName = i.CreatedBy != null
                    ? (i.CreatedBy.DisplayName
                       ?? (((i.CreatedBy.FirstName ?? "") + " " + (i.CreatedBy.LastName ?? "")).Trim() != ""
                            ? ((i.CreatedBy.FirstName ?? "") + " " + (i.CreatedBy.LastName ?? "")).Trim()
                            : (i.CreatedBy.UserName ?? i.CreatedBy.Email)))
                    : null,
                UpdatedById = i.UpdatedById,
                AssigneeId = i.AssigneeId,
                AssigneeName = i.Assignee != null
                    ? (i.Assignee.DisplayName
                       ?? (((i.Assignee.FirstName ?? "") + " " + (i.Assignee.LastName ?? "")).Trim() != ""
                            ? ((i.Assignee.FirstName ?? "") + " " + (i.Assignee.LastName ?? "")).Trim()
                            : (i.Assignee.UserName ?? i.Assignee.Email)))
                    : null,
                AssigneeAvatarUrl = i.Assignee != null ? i.Assignee.AvatarUrl : null,
                AssigneeIds = i.Assignees.Select(a => a.UserId).ToList(),
                LabelIds = i.Labels.Select(l => l.LabelId).ToList(),
                ModuleIds = i.ModuleIssues.Select(mi => mi.ModuleId).ToList(),
                CycleId = i.CycleIssues.Select(ci => (Guid?)ci.CycleId).FirstOrDefault(),
                CycleName = i.CycleIssues.Select(ci => ci.Cycle.Name).FirstOrDefault(),
                ParentId = i.ParentId,
                SubIssueCount = i.SubIssues.Count,
                SubIssueCompletedCount = i.SubIssues
                    .Count(s => s.State.Category == StateCategory.Completed
                                || s.State.Category == StateCategory.Cancelled),
                IssueTypeId = i.IssueTypeId,
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

    public async Task<IssueDto> GetByIdAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default)
    {
        // Detail view needs the full graph for back-references; AsNoTracking is still safe
        // because we never persist the loaded entity from this read path.
        var issue = await db.Issues
            .AsNoTracking()
            .Include(i => i.State)
            .Include(i => i.Assignee)
            .Include(i => i.CreatedBy)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Include(i => i.CycleIssues).ThenInclude(ci => ci.Cycle)
            .Include(i => i.ModuleIssues)
            .Include(i => i.SubIssues).ThenInclude(s => s.State)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, ct)
            ?? throw new NotFoundException("Issue not found.");

        return IssueMapper.MapToDto(issue);
    }

    public async Task<IssueDto> UpdateAsync(string workspaceSlug, Guid projectId, Guid issueId, UpdateIssueDto dto, Guid currentUserId, CancellationToken ct = default)
    {
        var issue = await db.Issues
            .Include(i => i.State)
            .Include(i => i.Assignee)
            .Include(i => i.CreatedBy)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Include(i => i.CycleIssues).ThenInclude(ci => ci.Cycle)
            .Include(i => i.ModuleIssues)
            .Include(i => i.SubIssues).ThenInclude(s => s.State)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, ct)
            ?? throw new NotFoundException("Issue not found.");

        var oldStateName = issue.State?.Name;
        var oldPriority = issue.Priority.ToString();
        var oldTitle = issue.Title;

        if (dto.Title is not null) issue.Title = dto.Title;

        var descriptionTouched = dto.Description is not null || dto.DescriptionHtml is not null || dto.DescriptionJson is not null;
        if (dto.DescriptionHtml is not null) issue.DescriptionHtml = Sanitize(dto.DescriptionHtml);
        if (dto.DescriptionJson is not null) issue.DescriptionJson = dto.DescriptionJson;
        if (dto.Description is not null) issue.Description = dto.Description;
        if (descriptionTouched)
            issue.Description = ComputePlainDescription(issue.DescriptionJson, issue.DescriptionHtml, dto.Description ?? issue.Description);

        if (dto.Priority is not null) issue.Priority = dto.Priority.Value;
        if (dto.AssigneeId is not null) issue.AssigneeId = dto.AssigneeId;
        if (dto.ParentId is not null) issue.ParentId = dto.ParentId;
        if (dto.IssueTypeId is not null) issue.IssueTypeId = dto.IssueTypeId;
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
                var canApprove = await CanApproveAsync(currentUserId, issue.ProjectId, ct);
                if (!canApprove)
                    throw new ConflictException(
                        "Esta tarea requiere aprobación de un Administrador o Gestor para moverse a este estado.",
                        code: "ApprovalRequired");

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

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex,
                "Failed to persist Issue update. IssueId={IssueId} ProjectId={ProjectId} ChangedFields={Fields}",
                issue.Id, projectId,
                new
                {
                    Title = dto.Title is not null,
                    Description = dto.Description is not null,
                    DescriptionHtml = dto.DescriptionHtml is not null,
                    DescriptionJson = dto.DescriptionJson is not null,
                    Priority = dto.Priority is not null,
                    StateId = dto.StateId is not null,
                    AssigneeId = dto.AssigneeId is not null,
                    AssigneeIds = dto.AssigneeIds is not null,
                    LabelIds = dto.LabelIds is not null,
                    ParentId = dto.ParentId is not null,
                    StartDate = dto.StartDate is not null,
                    DueDate = dto.DueDate is not null,
                    CycleId = dto.CycleId is not null,
                    ModuleIds = dto.ModuleIds is not null
                });
            throw;
        }

        var actorId = currentUserId;

        if (dto.StateId is not null && issue.State?.Name != oldStateName)
            await activityService.LogActivityAsync(issue.Id, actorId, "state", oldStateName, issue.State?.Name, ct);

        if (dto.Priority is not null && issue.Priority.ToString() != oldPriority)
            await activityService.LogActivityAsync(issue.Id, actorId, "priority", oldPriority, issue.Priority.ToString(), ct);

        if (dto.Title is not null && issue.Title != oldTitle)
            await activityService.LogActivityAsync(issue.Id, actorId, "name", oldTitle, issue.Title, ct);

        await EmitIssueEventAsync("issue.updated", workspaceSlug, projectId, issue.Id, ct);

        return IssueMapper.MapToDto(issue);
    }

    public async Task<IssueDto> ApproveAsync(
        string workspaceSlug, Guid projectId, Guid issueId, Guid targetStateId, Guid currentUserId, CancellationToken ct = default)
    {
        var canApprove = await CanApproveAsync(currentUserId, projectId, ct);
        if (!canApprove)
            throw new ForbiddenException("Solo un Administrador o Gestor puede aprobar esta tarea.");

        var issue = await db.Issues
            .Include(i => i.State)
            .Include(i => i.Assignee)
            .Include(i => i.CreatedBy)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Include(i => i.CycleIssues).ThenInclude(ci => ci.Cycle)
            .Include(i => i.ModuleIssues)
            .Include(i => i.SubIssues).ThenInclude(s => s.State)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, ct)
            ?? throw new NotFoundException("Issue not found.");

        if (!issue.RequiresAdminApproval || !issue.ApprovalRequiredStateIds.Contains(targetStateId))
            throw new ConflictException(
                "Esta tarea no requiere aprobación para el estado destino.",
                code: "ApprovalNotRequired");

        var state = await db.States.FindAsync([targetStateId], ct)
            ?? throw new NotFoundException($"State {targetStateId} not found.");

        var oldStateName = issue.State?.Name;
        issue.StateId = state.Id;
        issue.State = state;
        issue.ApprovedById = currentUserId;
        issue.ApprovedAt = DateTime.UtcNow;
        issue.CompletedAt = state.Category == StateCategory.Completed
            ? (issue.CompletedAt ?? DateTime.UtcNow)
            : null;

        await db.SaveChangesAsync(ct);

        if (state.Name != oldStateName)
            await activityService.LogActivityAsync(issue.Id, currentUserId, "state", oldStateName, state.Name, ct);

        await EmitIssueEventAsync("issue.updated", workspaceSlug, projectId, issue.Id, ct);

        return IssueMapper.MapToDto(issue);
    }

    public async Task DeleteAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default)
    {
        var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, ct)
            ?? throw new NotFoundException("Issue not found.");

        issue.IsDeleted = true;
        issue.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        await EmitIssueEventAsync("issue.deleted", workspaceSlug, projectId, issueId, ct);
    }

    public async Task AddAssigneeAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid userId, CancellationToken ct = default)
    {
        var issue = await db.Issues
            .Include(i => i.Assignees)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, ct)
            ?? throw new NotFoundException("Issue not found.");

        if (issue.Assignees.Any(a => a.UserId == userId))
            return;

        db.IssueAssignees.Add(new IssueAssignee { IssueId = issueId, UserId = userId });
        await db.SaveChangesAsync(ct);

        await EmitIssueEventAsync("issue.updated", workspaceSlug, projectId, issueId, ct);
    }

    public async Task RemoveAssigneeAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid userId, CancellationToken ct = default)
    {
        var assignee = await db.IssueAssignees
            .FirstOrDefaultAsync(a => a.IssueId == issueId && a.UserId == userId, ct)
            ?? throw new NotFoundException("Assignee not found on this issue.");

        db.IssueAssignees.Remove(assignee);
        await db.SaveChangesAsync(ct);

        await EmitIssueEventAsync("issue.updated", workspaceSlug, projectId, issueId, ct);
    }

    public async Task AddLabelAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid labelId, CancellationToken ct = default)
    {
        var issue = await db.Issues
            .Include(i => i.Labels)
            .FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, ct)
            ?? throw new NotFoundException("Issue not found.");

        if (issue.Labels.Any(l => l.LabelId == labelId))
            return;

        db.IssueLabels.Add(new IssueLabel { IssueId = issueId, LabelId = labelId });
        await db.SaveChangesAsync(ct);

        await EmitIssueEventAsync("issue.updated", workspaceSlug, projectId, issueId, ct);
    }

    public async Task RemoveLabelAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid labelId, CancellationToken ct = default)
    {
        var label = await db.IssueLabels
            .FirstOrDefaultAsync(l => l.IssueId == issueId && l.LabelId == labelId, ct)
            ?? throw new NotFoundException("Label not found on this issue.");

        db.IssueLabels.Remove(label);
        await db.SaveChangesAsync(ct);

        await EmitIssueEventAsync("issue.updated", workspaceSlug, projectId, issueId, ct);
    }

    public async Task AttachCycleAsync(Guid projectId, Guid issueId, Guid cycleId, Guid userId, CancellationToken ct = default)
    {
        var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, ct)
            ?? throw new NotFoundException("Issue not found.");

        var existing = await db.CycleIssues.FirstOrDefaultAsync(ci => ci.IssueId == issueId, ct);
        if (existing != null)
        {
            if (existing.CycleId == cycleId) return;
            db.CycleIssues.Remove(existing);
        }

        db.CycleIssues.Add(new CycleIssue { CycleId = cycleId, IssueId = issueId, AddedById = userId });
        await db.SaveChangesAsync(ct);

        await EmitIssueEventAsync("issue.updated", string.Empty, projectId, issueId, ct);
    }

    public async Task DetachCycleAsync(Guid projectId, Guid issueId, CancellationToken ct = default)
    {
        var existing = await db.CycleIssues.FirstOrDefaultAsync(ci => ci.IssueId == issueId, ct);
        if (existing == null) return;
        db.CycleIssues.Remove(existing);
        await db.SaveChangesAsync(ct);

        await EmitIssueEventAsync("issue.updated", string.Empty, projectId, issueId, ct);
    }

    public async Task AttachModulesAsync(Guid projectId, Guid issueId, List<Guid> moduleIds, Guid userId, CancellationToken ct = default)
    {
        var issue = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId, ct)
            ?? throw new NotFoundException("Issue not found.");

        var incoming = moduleIds.Distinct().ToHashSet();
        var existing = await db.ModuleIssues.Where(mi => mi.IssueId == issueId).ToListAsync(ct);
        var toAdd = incoming.Where(mid => !existing.Any(mi => mi.ModuleId == mid)).ToList();

        db.ModuleIssues.AddRange(toAdd.Select(mid => new ModuleIssue { ModuleId = mid, IssueId = issueId, AddedById = userId }));
        await db.SaveChangesAsync(ct);

        await EmitIssueEventAsync("issue.updated", string.Empty, projectId, issueId, ct);
    }

    public async Task DetachModuleAsync(Guid projectId, Guid issueId, Guid moduleId, CancellationToken ct = default)
    {
        var existing = await db.ModuleIssues.FirstOrDefaultAsync(mi => mi.IssueId == issueId && mi.ModuleId == moduleId, ct)
            ?? throw new NotFoundException("Module not attached to this issue.");
        db.ModuleIssues.Remove(existing);
        await db.SaveChangesAsync(ct);

        await EmitIssueEventAsync("issue.updated", string.Empty, projectId, issueId, ct);
    }

    public async Task<List<IssueDto>> SearchSimilarAsync(string workspaceSlug, Guid projectId, string title, double threshold = 0.3, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var issues = await db.Issues
            .AsNoTracking()
            .Include(i => i.State)
            .Include(i => i.Assignee)
            .Include(i => i.CreatedBy)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .Include(i => i.CycleIssues).ThenInclude(ci => ci.Cycle)
            .Include(i => i.ModuleIssues)
            .Include(i => i.SubIssues).ThenInclude(s => s.State)
            .Where(i => i.ProjectId == projectId && i.Project.WorkspaceId == workspace.Id)
            .Where(i => EF.Functions.TrigramsSimilarity(i.Title, title) >= threshold)
            .OrderByDescending(i => EF.Functions.TrigramsSimilarity(i.Title, title))
            .Take(10)
            .ToListAsync(ct);

        return issues.Select(IssueMapper.MapToDto).ToList();
    }

}
