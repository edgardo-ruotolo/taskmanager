using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.Labels.Entities;
using TaskManager.Api.Modules.Notifications.Entities;
using TaskManager.Api.Modules.Recurring.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Recurring.Services;

public class RecurringExecutor(AppDbContext db, ILogger<RecurringExecutor> logger) : IRecurringExecutor
{
    private const string RecurrentLabelName = "Recurrent";
    private const string RecurrentLabelColor = "#8B5CF6";

    public async Task ExecuteAsync(Guid templateId, CancellationToken ct = default)
    {
        var template = await db.RecurringIssueTemplates
            .Include(t => t.Companies)
            .Include(t => t.Assignees)
            .Include(t => t.Labels)
            .FirstOrDefaultAsync(t => t.Id == templateId, ct);

        if (template is null)
        {
            logger.LogWarning("RecurringExecutor: template {TemplateId} not found.", templateId);
            return;
        }

        var nowUtc = DateTime.UtcNow;
        TimeZoneInfo tz;
        try { tz = TimeZoneInfo.FindSystemTimeZoneById(template.Timezone); }
        catch { tz = TimeZoneInfo.Utc; }

        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, tz);

        // Skip: execution window missed
        if (template.EndTime.HasValue && TimeOnly.FromDateTime(nowLocal) > template.EndTime.Value)
        {
            var failedRun = new RecurringIssueRun
            {
                WorkspaceId = template.WorkspaceId,
                TemplateId = template.Id,
                ScheduledFor = template.NextRunAt ?? nowUtc,
                ExecutedAt = nowUtc,
                Status = RecurringRunStatus.Failed,
                ErrorMessage = "execution_window_missed"
            };
            db.RecurringIssueRuns.Add(failedRun);
            AdvanceNextRun(template, nowUtc);
            await db.SaveChangesAsync(ct);
            return;
        }

        // Skip manual
        if (template.SkipNextRun)
        {
            var skippedRun = new RecurringIssueRun
            {
                WorkspaceId = template.WorkspaceId,
                TemplateId = template.Id,
                ScheduledFor = template.NextRunAt ?? nowUtc,
                ExecutedAt = nowUtc,
                Status = RecurringRunStatus.SkippedManual
            };
            db.RecurringIssueRuns.Add(skippedRun);
            template.SkipNextRun = false;
            template.LastRunAt = nowUtc;
            AdvanceNextRun(template, nowUtc);
            await db.SaveChangesAsync(ct);
            return;
        }

        // No companies
        if (template.Companies.Count == 0)
        {
            AdvanceNextRun(template, nowUtc);
            await db.SaveChangesAsync(ct);
            return;
        }

        var run = new RecurringIssueRun
        {
            WorkspaceId = template.WorkspaceId,
            TemplateId = template.Id,
            ScheduledFor = template.NextRunAt ?? nowUtc,
            Status = RecurringRunStatus.Success
        };
        db.RecurringIssueRuns.Add(run);
        await db.SaveChangesAsync(ct);

        var blockedByIssues = new List<Issue>();
        var totalCompanies = template.Companies.Count;
        var successCount = 0;

        foreach (var templateCompany in template.Companies)
        {
            try
            {
                var blocked = await ProcessCompanyAsync(template, run, templateCompany.CompanyId, nowUtc, blockedByIssues, ct);
                if (!blocked) successCount++;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "RecurringExecutor: error processing company {CompanyId} for template {TemplateId}.",
                    templateCompany.CompanyId, templateId);
            }
        }

        if (blockedByIssues.Count >= totalCompanies && successCount == 0)
        {
            run.Status = RecurringRunStatus.SkippedPreviousNotDone;
            foreach (var blocked in blockedByIssues)
                run.BlockedByIssues.Add(blocked);

            await NotifyAdminsBlockedAsync(template, blockedByIssues, ct);
        }

        run.ExecutedAt = DateTime.UtcNow;
        template.LastRunAt = DateTime.UtcNow;
        AdvanceNextRun(template, DateTime.UtcNow);
        await db.SaveChangesAsync(ct);
    }

    private async Task<bool> ProcessCompanyAsync(
        RecurringIssueTemplate template,
        RecurringIssueRun run,
        Guid companyId,
        DateTime nowUtc,
        List<Issue> blockedByIssues,
        CancellationToken ct)
    {
        // Check if previous issue from this template for this company is incomplete
        var lastRunIssue = await db.RecurringIssueRunIssues
            .Where(ri => ri.CompanyId == companyId && ri.Run.TemplateId == template.Id && ri.Run.Status == RecurringRunStatus.Success)
            .OrderByDescending(ri => ri.Run.ScheduledFor)
            .Include(ri => ri.Issue)
                .ThenInclude(i => i.State)
            .FirstOrDefaultAsync(ct);

        if (lastRunIssue?.Issue?.State != null &&
            lastRunIssue.Issue.State.Category != StateCategory.Completed &&
            lastRunIssue.Issue.State.Category != StateCategory.Cancelled)
        {
            blockedByIssues.Add(lastRunIssue.Issue);
            return true;
        }

        // Resolve state: find state matching the template's StateGroup
        var targetCategory = ParseStateCategory(template.StateGroup);
        var state = await db.States
            .Where(s => s.Category == targetCategory)
            .OrderBy(s => s.Sequence)
            .FirstOrDefaultAsync(ct)
            ?? await db.States.OrderBy(s => s.Sequence).FirstOrDefaultAsync(ct);

        if (state is null)
        {
            logger.LogWarning("RecurringExecutor: no state found for category {Category}.", template.StateGroup);
            return false;
        }

        var today = DateOnly.FromDateTime(nowUtc);
        var issue = new Issue
        {
            Title = template.Name,
            Description = template.DescriptionHtml,
            Priority = ParsePriority(template.Priority),
            StateId = state.Id,
            CompanyId = companyId,
            CreatedById = template.CreatedById,
            DueDate = today.AddDays(template.TargetDateOffsetDays).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc)
        };

        db.Issues.Add(issue);
        await db.SaveChangesAsync(ct);

        // Get or create "Recurrent" label (workspace-level)
        var recurrentLabel = await db.Labels
            .FirstOrDefaultAsync(l => l.WorkspaceId == template.WorkspaceId &&
                                      l.Name.ToLower() == RecurrentLabelName.ToLower(), ct);

        if (recurrentLabel is null)
        {
            recurrentLabel = new Label
            {
                Name = RecurrentLabelName,
                Color = RecurrentLabelColor,
                WorkspaceId = template.WorkspaceId
            };
            db.Labels.Add(recurrentLabel);
            await db.SaveChangesAsync(ct);
        }

        // Add assignees from template
        var assignees = template.Assignees.Select(a => new IssueAssignee
        {
            IssueId = issue.Id,
            UserId = a.AssigneeId
        }).ToList();
        if (assignees.Count > 0) db.IssueAssignees.AddRange(assignees);

        // Add labels: template labels + recurrent label
        var labelIds = template.Labels.Select(l => l.LabelId).ToHashSet();
        labelIds.Add(recurrentLabel.Id);

        var issueLabels = labelIds.Select(lid => new IssueLabel
        {
            IssueId = issue.Id,
            LabelId = lid
        }).ToList();
        db.IssueLabels.AddRange(issueLabels);

        // Link run → issue
        db.RecurringIssueRunIssues.Add(new RecurringIssueRunIssue
        {
            RunId = run.Id,
            IssueId = issue.Id,
            CompanyId = companyId
        });

        await db.SaveChangesAsync(ct);
        return false;
    }

    private async Task NotifyAdminsBlockedAsync(RecurringIssueTemplate template, List<Issue> blockedIssues, CancellationToken ct)
    {
        var admins = await db.WorkspaceMembers
            .Where(m => m.WorkspaceId == template.WorkspaceId && m.Role == Workspaces.Entities.WorkspaceRole.Admin && m.IsActive)
            .Select(m => m.UserId)
            .ToListAsync(ct);

        var notifications = admins.Select(adminId => new Notification
        {
            RecipientId = adminId,
            Title = "Tarea recurrente bloqueada",
            Message = $"La tarea recurrente '{template.Name}' fue omitida porque issues anteriores aún no están completados.",
            EntityType = "recurring_template",
            EntityId = template.Id.ToString(),
            IsRead = false
        }).ToList();

        if (notifications.Count > 0)
        {
            db.Notifications.AddRange(notifications);
            await db.SaveChangesAsync(ct);
        }
    }

    private void AdvanceNextRun(RecurringIssueTemplate template, DateTime after)
    {
        template.NextRunAt = RecurringScheduleCalculator.ComputeNextRun(template, after);
        if (template.NextRunAt is null)
            template.IsActive = false;
    }

    private static StateCategory ParseStateCategory(string group) => group.ToLowerInvariant() switch
    {
        "backlog" => StateCategory.Backlog,
        "started" => StateCategory.Started,
        "completed" => StateCategory.Completed,
        "cancelled" => StateCategory.Cancelled,
        _ => StateCategory.Unstarted
    };

    private static IssuePriority ParsePriority(string priority) => priority.ToLowerInvariant() switch
    {
        "urgent" => IssuePriority.Urgent,
        "high" => IssuePriority.High,
        "medium" => IssuePriority.Medium,
        "low" => IssuePriority.Low,
        _ => IssuePriority.None
    };
}
