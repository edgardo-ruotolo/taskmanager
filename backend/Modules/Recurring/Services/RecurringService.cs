using Microsoft.EntityFrameworkCore;
using Npgsql;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Recurring.Dtos;
using TaskManager.Api.Modules.Recurring.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Recurring.Services;

public class RecurringService(AppDbContext db, IConfiguration configuration) : IRecurringService
{
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    public async Task<RecurringTemplateDto> CreateAsync(string workspaceSlug, Guid userId, CreateRecurringTemplateDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var member = await db.WorkspaceMembers.FirstOrDefaultAsync(
            m => m.WorkspaceId == workspace.Id && m.UserId == userId && m.IsActive, ct)
            ?? throw new ForbiddenException("No eres miembro de este workspace.");

        if (member.Role < WorkspaceRole.Admin)
            throw new ForbiddenException("Solo los administradores pueden crear tareas recurrentes.");

        if (dto.ProjectIds.Count > 0)
        {
            var validCount = await db.Projects
                .CountAsync(c => dto.ProjectIds.Contains(c.Id) && c.WorkspaceId == workspace.Id, ct);
            if (validCount != dto.ProjectIds.Count)
                throw new NotFoundException("Una o más empresas no existen en este workspace.");
        }

        if (dto.IssueTypeId.HasValue)
        {
            var typeExists = await db.IssueTypes
                .AnyAsync(t => t.Id == dto.IssueTypeId.Value && t.WorkspaceId == workspace.Id, ct);
            if (!typeExists)
                throw new NotFoundException("El tipo de tarea no existe en este workspace.");
        }

        var sequenceId = await GenerateSequenceIdAsync(workspace.Id, ct);

        var template = new RecurringIssueTemplate
        {
            WorkspaceId = workspace.Id,
            SequenceId = sequenceId,
            Name = dto.Name,
            DescriptionHtml = dto.DescriptionHtml,
            Frequency = dto.Frequency,
            Interval = dto.Interval,
            DaysOfWeek = dto.DaysOfWeek,
            DayOfMonth = dto.DayOfMonth,
            MonthOfYear = dto.MonthOfYear,
            RunAtTime = ParseTime(dto.RunAtTime),
            EndTime = dto.EndTime != null ? ParseTime(dto.EndTime) : null,
            Timezone = dto.Timezone,
            StartsOn = DateOnly.Parse(dto.StartsOn),
            EndsOn = dto.EndsOn != null ? DateOnly.Parse(dto.EndsOn) : null,
            StateGroup = dto.StateGroup,
            Priority = dto.Priority,
            StartDateOffsetDays = dto.StartDateOffsetDays,
            TargetDateOffsetDays = dto.TargetDateOffsetDays,
            BlockPolicy = dto.BlockPolicy,
            IssueTypeId = dto.IssueTypeId,
            CreatedById = userId
        };

        db.RecurringIssueTemplates.Add(template);
        await db.SaveChangesAsync(ct);

        await SyncPivots(template.Id, dto.ProjectIds, dto.AssigneeIds, dto.LabelIds, ct);

        template.NextRunAt = RecurringScheduleCalculator.ComputeNextRun(template);
        await db.SaveChangesAsync(ct);

        return await LoadAndMapAsync(template.Id, ct);
    }

    public async Task<PagedResult<RecurringTemplateDto>> ListAsync(
        string workspaceSlug,
        Guid userId,
        int page,
        int pageSize,
        string? search,
        RecurringFrequency? frequency,
        string? status,
        CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var isMember = await db.WorkspaceMembers.AnyAsync(
            m => m.WorkspaceId == workspace.Id && m.UserId == userId && m.IsActive, ct);
        if (!isMember) throw new ForbiddenException("No eres miembro de este workspace.");

        var safePage = page < 1 ? 1 : page;
        var safePageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var query = db.RecurringIssueTemplates
            .Where(t => t.WorkspaceId == workspace.Id)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(t => EF.Functions.ILike(t.Name, pattern));
        }

        if (frequency.HasValue)
            query = query.Where(t => t.Frequency == frequency.Value);

        if (!string.IsNullOrWhiteSpace(status))
        {
            var normalized = status.Trim().ToLowerInvariant();
            query = normalized switch
            {
                "active" => query.Where(t => t.IsActive && !t.IsPaused),
                "paused" => query.Where(t => t.IsPaused),
                "inactive" => query.Where(t => !t.IsActive),
                _ => query
            };
        }

        var totalCount = await query.CountAsync(ct);

        var templates = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .Include(t => t.Projects)
                .ThenInclude(p => p.Project)
            .Include(t => t.Assignees)
                .ThenInclude(a => a.Assignee)
            .Include(t => t.Labels)
            .ToListAsync(ct);

        return new PagedResult<RecurringTemplateDto>
        {
            Items = templates.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = safePage,
            PageSize = safePageSize
        };
    }

    public async Task<RecurringTemplateDto> GetByIdAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var isMember = await db.WorkspaceMembers.AnyAsync(
            m => m.WorkspaceId == workspace.Id && m.UserId == userId && m.IsActive, ct);
        if (!isMember) throw new ForbiddenException("No eres miembro de este workspace.");

        return await LoadAndMapAsync(templateId, ct);
    }

    public async Task<RecurringTemplateDto> UpdateAsync(string workspaceSlug, Guid templateId, Guid userId, UpdateRecurringTemplateDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var member = await db.WorkspaceMembers.FirstOrDefaultAsync(
            m => m.WorkspaceId == workspace.Id && m.UserId == userId && m.IsActive, ct)
            ?? throw new ForbiddenException("No eres miembro de este workspace.");

        if (member.Role < WorkspaceRole.Admin)
            throw new ForbiddenException("Solo los administradores pueden editar tareas recurrentes.");

        var template = await db.RecurringIssueTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Tarea recurrente no encontrada.");

        if (dto.Name != null) template.Name = dto.Name;
        // Semántica explícita: dto.DescriptionHtml == null significa "no tocar"; "" significa
        // "vaciar la descripción" (válido). El frontend siempre envía el campo aunque esté vacío.
        if (dto.DescriptionHtml != null) template.DescriptionHtml = dto.DescriptionHtml;
        if (dto.Frequency != null) template.Frequency = dto.Frequency.Value;
        if (dto.Interval != null) template.Interval = dto.Interval.Value;
        if (dto.DaysOfWeek != null) template.DaysOfWeek = dto.DaysOfWeek;
        if (dto.DayOfMonth.HasValue) template.DayOfMonth = dto.DayOfMonth;
        if (dto.MonthOfYear.HasValue) template.MonthOfYear = dto.MonthOfYear;
        if (dto.RunAtTime != null) template.RunAtTime = ParseTime(dto.RunAtTime);
        if (dto.EndTime != null) template.EndTime = ParseTime(dto.EndTime);
        if (dto.Timezone != null) template.Timezone = dto.Timezone;
        if (dto.StartsOn != null) template.StartsOn = DateOnly.Parse(dto.StartsOn);
        if (dto.EndsOn != null) template.EndsOn = DateOnly.Parse(dto.EndsOn);
        if (dto.StateGroup != null) template.StateGroup = dto.StateGroup;
        if (dto.Priority != null) template.Priority = dto.Priority;
        if (dto.StartDateOffsetDays != null) template.StartDateOffsetDays = dto.StartDateOffsetDays.Value;
        if (dto.TargetDateOffsetDays != null) template.TargetDateOffsetDays = dto.TargetDateOffsetDays.Value;
        if (dto.BlockPolicy != null) template.BlockPolicy = dto.BlockPolicy.Value;
        if (dto.IssueTypeId.HasValue)
        {
            var typeExists = await db.IssueTypes
                .AnyAsync(t => t.Id == dto.IssueTypeId.Value && t.WorkspaceId == workspace.Id, ct);
            if (!typeExists)
                throw new NotFoundException("El tipo de tarea no existe en este workspace.");
            template.IssueTypeId = dto.IssueTypeId;
        }

        if (dto.ProjectIds != null || dto.AssigneeIds != null || dto.LabelIds != null)
        {
            await SyncPivots(
                template.Id,
                dto.ProjectIds ?? [],
                dto.AssigneeIds ?? [],
                dto.LabelIds ?? [],
                ct);
        }

        template.NextRunAt = RecurringScheduleCalculator.ComputeNextRun(template);
        await db.SaveChangesAsync(ct);

        return await LoadAndMapAsync(template.Id, ct);
    }

    public async Task DeleteAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var member = await db.WorkspaceMembers.FirstOrDefaultAsync(
            m => m.WorkspaceId == workspace.Id && m.UserId == userId && m.IsActive, ct)
            ?? throw new ForbiddenException("No eres miembro de este workspace.");

        if (member.Role < WorkspaceRole.Admin)
            throw new ForbiddenException("Solo los administradores pueden eliminar tareas recurrentes.");

        var template = await db.RecurringIssueTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Tarea recurrente no encontrada.");

        template.IsDeleted = true;
        template.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<RecurringTemplateDto> PauseAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default)
    {
        var template = await GetTemplateWithAdminCheckAsync(workspaceSlug, templateId, userId, ct);
        template.IsPaused = true;
        await db.SaveChangesAsync(ct);
        return await LoadAndMapAsync(template.Id, ct);
    }

    public async Task<RecurringTemplateDto> ResumeAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default)
    {
        var template = await GetTemplateWithAdminCheckAsync(workspaceSlug, templateId, userId, ct);
        template.IsPaused = false;
        await db.SaveChangesAsync(ct);
        return await LoadAndMapAsync(template.Id, ct);
    }

    public async Task<RecurringTemplateDto> SkipNextAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default)
    {
        var template = await GetTemplateWithAdminCheckAsync(workspaceSlug, templateId, userId, ct);
        // Toggle: si ya estaba marcado para omitir, deshacer; si no, marcar.
        template.SkipNextRun = !template.SkipNextRun;
        await db.SaveChangesAsync(ct);
        return await LoadAndMapAsync(template.Id, ct);
    }

    public async Task<RecurringTemplateDto> DuplicateAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var member = await db.WorkspaceMembers.FirstOrDefaultAsync(
            m => m.WorkspaceId == workspace.Id && m.UserId == userId && m.IsActive, ct)
            ?? throw new ForbiddenException("No eres miembro de este workspace.");

        if (member.Role < WorkspaceRole.Admin)
            throw new ForbiddenException("Solo los administradores pueden duplicar tareas recurrentes.");

        var original = await db.RecurringIssueTemplates
            .Include(t => t.Projects)
            .Include(t => t.Assignees)
            .Include(t => t.Labels)
            .FirstOrDefaultAsync(t => t.Id == templateId && t.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Tarea recurrente no encontrada.");

        var sequenceId = await GenerateSequenceIdAsync(workspace.Id, ct);

        var copy = new RecurringIssueTemplate
        {
            WorkspaceId = workspace.Id,
            SequenceId = sequenceId,
            Name = original.Name + " (copia)",
            DescriptionHtml = original.DescriptionHtml,
            Frequency = original.Frequency,
            Interval = original.Interval,
            DaysOfWeek = (int[])original.DaysOfWeek.Clone(),
            DayOfMonth = original.DayOfMonth,
            MonthOfYear = original.MonthOfYear,
            RunAtTime = original.RunAtTime,
            EndTime = original.EndTime,
            Timezone = original.Timezone,
            StartsOn = original.StartsOn,
            EndsOn = original.EndsOn,
            // Por seguridad la copia arranca pausada — el usuario revisa y reanuda.
            IsActive = true,
            IsPaused = true,
            StateGroup = original.StateGroup,
            Priority = original.Priority,
            StartDateOffsetDays = original.StartDateOffsetDays,
            TargetDateOffsetDays = original.TargetDateOffsetDays,
            BlockPolicy = original.BlockPolicy,
            IssueTypeId = original.IssueTypeId,
            CreatedById = userId
        };

        db.RecurringIssueTemplates.Add(copy);
        await db.SaveChangesAsync(ct);

        var projectIds = original.Projects.Select(p => p.ProjectId).ToList();
        var assigneeIds = original.Assignees.Select(a => a.AssigneeId).ToList();
        var labelIds = original.Labels.Select(l => l.LabelId).ToList();
        await SyncPivots(copy.Id, projectIds, assigneeIds, labelIds, ct);

        copy.NextRunAt = RecurringScheduleCalculator.ComputeNextRun(copy);
        await db.SaveChangesAsync(ct);

        return await LoadAndMapAsync(copy.Id, ct);
    }

    public async Task<List<RecurringRunDto>> GetRunsAsync(string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var isMember = await db.WorkspaceMembers.AnyAsync(
            m => m.WorkspaceId == workspace.Id && m.UserId == userId && m.IsActive, ct);
        if (!isMember) throw new ForbiddenException("No eres miembro de este workspace.");

        var runs = await db.RecurringIssueRuns
            .Where(r => r.TemplateId == templateId && r.WorkspaceId == workspace.Id)
            .Include(r => r.GeneratedIssues)
            .Include(r => r.BlockedByIssues)
            .OrderByDescending(r => r.ScheduledFor)
            .ToListAsync(ct);

        return runs.Select(MapRunToDto).ToList();
    }

    public async Task<RecurringPreviewDto> PreviewAsync(string workspaceSlug, Guid templateId, int count, CancellationToken ct = default)
    {
        var template = await db.RecurringIssueTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId, ct)
            ?? throw new NotFoundException("Tarea recurrente no encontrada.");

        var maxCount = Math.Min(count, 20);
        var results = new List<DateTime>();
        DateTime? after = null;

        for (var i = 0; i < maxCount; i++)
        {
            var next = RecurringScheduleCalculator.ComputeNextRun(template, after);
            if (next is null) break;
            results.Add(next.Value);
            after = next.Value;
        }

        return new RecurringPreviewDto { NextRuns = results };
    }

    public async Task<RecurringFromIssuePrefillDto> FromIssueAsync(string workspaceSlug, Guid issueId, Guid userId, CancellationToken ct = default)
    {
        var issue = await db.Issues
            .Include(i => i.State)
            .Include(i => i.Assignees)
            .Include(i => i.Labels)
            .FirstOrDefaultAsync(i => i.Id == issueId, ct)
            ?? throw new NotFoundException("Issue no encontrado.");

        var stateGroup = issue.State?.Category.ToString().ToLowerInvariant() ?? "unstarted";

        return new RecurringFromIssuePrefillDto
        {
            Name = issue.Title,
            DescriptionHtml = issue.Description ?? string.Empty,
            Priority = issue.Priority.ToString().ToLowerInvariant(),
            StateGroup = stateGroup,
            IssueTypeId = issue.IssueTypeId,
            ProjectIds = [issue.ProjectId],
            AssigneeIds = issue.Assignees.Select(a => a.UserId).ToList(),
            LabelIds = issue.Labels.Select(l => l.LabelId).ToList()
        };
    }

    // --- Helpers ---

    private async Task<int> GenerateSequenceIdAsync(Guid workspaceId, CancellationToken ct)
    {
        var connString = configuration.GetConnectionString("Postgres")!;
        int sequenceId;

        await using var conn = new NpgsqlConnection(connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        var lockKey = BitConverter.ToInt64(workspaceId.ToByteArray(), 0);
        await using (var lockCmd = new NpgsqlCommand($"SELECT pg_advisory_xact_lock({lockKey})", conn, tx))
            await lockCmd.ExecuteNonQueryAsync(ct);

        await using (var seqCmd = new NpgsqlCommand(
            "SELECT COALESCE(MAX(\"SequenceId\"), 0) + 1 FROM \"RecurringIssueTemplates\" WHERE \"WorkspaceId\" = @wid AND \"IsDeleted\" = false",
            conn, tx))
        {
            seqCmd.Parameters.AddWithValue("wid", workspaceId);
            sequenceId = Convert.ToInt32(await seqCmd.ExecuteScalarAsync(ct));
        }

        await tx.CommitAsync(ct);
        await conn.CloseAsync();

        return sequenceId;
    }

    private async Task<RecurringIssueTemplate> GetTemplateWithAdminCheckAsync(
        string workspaceSlug, Guid templateId, Guid userId, CancellationToken ct)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var member = await db.WorkspaceMembers.FirstOrDefaultAsync(
            m => m.WorkspaceId == workspace.Id && m.UserId == userId && m.IsActive, ct)
            ?? throw new ForbiddenException("No eres miembro de este workspace.");

        if (member.Role < WorkspaceRole.Admin)
            throw new ForbiddenException("Solo los administradores pueden modificar tareas recurrentes.");

        return await db.RecurringIssueTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Tarea recurrente no encontrada.");
    }

    private async Task SyncPivots(Guid templateId, List<Guid> projectIds, List<Guid> assigneeIds, List<Guid> labelIds, CancellationToken ct)
    {
        var existingProjects = await db.RecurringIssueTemplateProjects
            .Where(x => x.TemplateId == templateId).ToListAsync(ct);
        db.RecurringIssueTemplateProjects.RemoveRange(existingProjects);

        var existingAssignees = await db.RecurringIssueTemplateAssignees
            .Where(x => x.TemplateId == templateId).ToListAsync(ct);
        db.RecurringIssueTemplateAssignees.RemoveRange(existingAssignees);

        var existingLabels = await db.RecurringIssueTemplateLabels
            .Where(x => x.TemplateId == templateId).ToListAsync(ct);
        db.RecurringIssueTemplateLabels.RemoveRange(existingLabels);

        db.RecurringIssueTemplateProjects.AddRange(
            projectIds.Select(cid => new RecurringIssueTemplateProject { TemplateId = templateId, ProjectId = cid }));
        db.RecurringIssueTemplateAssignees.AddRange(
            assigneeIds.Select(aid => new RecurringIssueTemplateAssignee { TemplateId = templateId, AssigneeId = aid }));
        db.RecurringIssueTemplateLabels.AddRange(
            labelIds.Select(lid => new RecurringIssueTemplateLabel { TemplateId = templateId, LabelId = lid }));

        await db.SaveChangesAsync(ct);
    }

    private async Task<RecurringTemplateDto> LoadAndMapAsync(Guid templateId, CancellationToken ct)
    {
        var template = await db.RecurringIssueTemplates
            .Include(t => t.Projects)
                .ThenInclude(p => p.Project)
            .Include(t => t.Assignees)
                .ThenInclude(a => a.Assignee)
            .Include(t => t.Labels)
            .FirstOrDefaultAsync(t => t.Id == templateId, ct)
            ?? throw new NotFoundException("Tarea recurrente no encontrada.");

        return MapToDto(template);
    }

    private static RecurringTemplateDto MapToDto(RecurringIssueTemplate t) => new()
    {
        Id = t.Id,
        SequenceId = t.SequenceId,
        WorkspaceId = t.WorkspaceId,
        Name = t.Name,
        DescriptionHtml = t.DescriptionHtml,
        Frequency = t.Frequency.ToString().ToLowerInvariant(),
        Interval = t.Interval,
        DaysOfWeek = t.DaysOfWeek,
        DayOfMonth = t.DayOfMonth,
        MonthOfYear = t.MonthOfYear,
        RunAtTime = t.RunAtTime.ToString("HH:mm:ss"),
        EndTime = t.EndTime?.ToString("HH:mm:ss"),
        Timezone = t.Timezone,
        StartsOn = t.StartsOn.ToString("yyyy-MM-dd"),
        EndsOn = t.EndsOn?.ToString("yyyy-MM-dd"),
        IsActive = t.IsActive,
        IsPaused = t.IsPaused,
        SkipNextRun = t.SkipNextRun,
        LastRunAt = t.LastRunAt,
        NextRunAt = t.NextRunAt,
        StateGroup = t.StateGroup,
        Priority = t.Priority,
        StartDateOffsetDays = t.StartDateOffsetDays,
        TargetDateOffsetDays = t.TargetDateOffsetDays,
        BlockPolicy = t.BlockPolicy.ToString(),
        IssueTypeId = t.IssueTypeId,
        CreatedById = t.CreatedById,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt,
        ProjectIds = t.Projects.Select(p => p.ProjectId).ToList(),
        AssigneeIds = t.Assignees.Select(a => a.AssigneeId).ToList(),
        LabelIds = t.Labels.Select(l => l.LabelId).ToList(),
        Projects = t.Projects
            .Where(p => p.Project != null)
            .Select(p => new RecurringTemplateProjectSummaryDto
            {
                Id = p.ProjectId,
                Identifier = p.Project!.Identifier,
                Name = p.Project.Name
            }).ToList(),
        Assignees = t.Assignees
            .Where(a => a.Assignee != null)
            .Select(a => new RecurringTemplateAssigneeSummaryDto
            {
                Id = a.AssigneeId,
                DisplayName = ResolveDisplayName(a.Assignee!),
                AvatarUrl = a.Assignee!.AvatarUrl
            }).ToList()
    };

    private static string ResolveDisplayName(User user)
    {
        if (!string.IsNullOrWhiteSpace(user.DisplayName)) return user.DisplayName!;
        var first = user.FirstName?.Trim();
        var last = user.LastName?.Trim();
        if (!string.IsNullOrEmpty(first) || !string.IsNullOrEmpty(last))
            return $"{first} {last}".Trim();
        return user.Email ?? user.UserName ?? string.Empty;
    }

    private static RecurringRunDto MapRunToDto(RecurringIssueRun r) => new()
    {
        Id = r.Id,
        TemplateId = r.TemplateId,
        ScheduledFor = r.ScheduledFor,
        ExecutedAt = r.ExecutedAt,
        Status = r.Status.ToString(),
        ErrorMessage = r.ErrorMessage,
        GeneratedIssueIds = r.GeneratedIssues.Select(i => new RecurringRunIssueRefDto
        {
            IssueId = i.IssueId,
            ProjectId = i.ProjectId
        }).ToList(),
        BlockedByIssueIds = r.BlockedByIssues.Select(i => i.Id).ToList(),
        CreatedAt = r.CreatedAt
    };

    private static TimeOnly ParseTime(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return new TimeOnly(6, 0);
        return TimeOnly.TryParse(value, out var result) ? result : new TimeOnly(6, 0);
    }
}
