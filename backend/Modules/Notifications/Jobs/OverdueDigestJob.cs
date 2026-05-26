using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Notifications;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Notifications.Entities;
using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Modules.Notifications.Jobs;

/// <summary>
/// Daily Hangfire recurring job — sends each Project Lead/Admin a single email
/// listing the overdue issues in their projects.
/// Idempotent via <see cref="EmailSentLog"/> with bucket = UTC date.
/// </summary>
public class OverdueDigestJob(
    AppDbContext db,
    INotificationDispatcher notifications,
    IConfiguration configuration,
    ILogger<OverdueDigestJob> logger)
{
    public const string RecurringJobId = "notifications-overdue-digest";

    public async Task RunAsync(CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var bucket = today.ToString("yyyy-MM-dd");
        var frontendUrl = configuration["App:FrontendUrl"]?.TrimEnd('/') ?? "";

        var overdueByProject = await db.Issues
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(i => !i.IsDeleted && !i.IsArchived
                && i.DueDate != null && i.DueDate < today
                && i.CompletedAt == null)
            .GroupBy(i => i.ProjectId)
            .Select(g => new
            {
                ProjectId = g.Key,
                Issues = g.Select(i => new
                {
                    i.Id,
                    i.SequenceId,
                    i.Title,
                    i.DueDate,
                    AssigneeName = i.Assignee == null
                        ? null
                        : (i.Assignee.FirstName ?? i.Assignee.UserName)
                }).ToList()
            })
            .ToListAsync(ct);

        if (overdueByProject.Count == 0)
        {
            logger.LogInformation("OverdueDigestJob: no overdue issues today");
            return;
        }

        var projectIds = overdueByProject.Select(x => x.ProjectId).ToList();

        var leaders = await db.ProjectMembers
            .AsNoTracking()
            .Where(m => projectIds.Contains(m.ProjectId)
                && (m.Role == ProjectRole.Lead || m.Role == ProjectRole.Admin))
            .Include(m => m.User)
            .Include(m => m.Project)
            .ToListAsync(ct);

        foreach (var membership in leaders)
        {
            var entry = overdueByProject.First(x => x.ProjectId == membership.ProjectId);
            var alreadySent = await db.EmailSentLogs
                .AnyAsync(l => l.UserId == membership.UserId
                    && l.Kind == nameof(EmailJobKind.LeaderOverdueDigest)
                    && l.Bucket == bucket
                    && l.EntityId == membership.ProjectId, ct);
            if (alreadySent) continue;

            notifications.Enqueue(new EmailJobPayload
            {
                Kind = EmailJobKind.LeaderOverdueDigest,
                RecipientUserId = membership.UserId,
                RecipientEmail = membership.User.Email ?? string.Empty,
                RecipientName = membership.User.FirstName ?? membership.User.UserName ?? string.Empty,
                EntityId = membership.ProjectId,
                Params = new Dictionary<string, object?>
                {
                    ["firstName"] = membership.User.FirstName ?? membership.User.UserName,
                    ["projectName"] = membership.Project.Name,
                    ["overdueCount"] = entry.Issues.Count,
                    ["projectUrl"] = $"{frontendUrl}/projects/{membership.ProjectId}",
                    ["issues"] = entry.Issues.Select(i => new
                    {
                        sequenceId = i.SequenceId,
                        title = i.Title,
                        dueDate = i.DueDate?.ToString("yyyy-MM-dd"),
                        assigneeName = i.AssigneeName,
                        issueUrl = $"{frontendUrl}/projects/{membership.ProjectId}/issues/{i.Id}"
                    }).ToList()
                }
            });

            db.EmailSentLogs.Add(new EmailSentLog
            {
                UserId = membership.UserId,
                Kind = nameof(EmailJobKind.LeaderOverdueDigest),
                Bucket = bucket,
                EntityId = membership.ProjectId
            });
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("OverdueDigestJob: dispatched {Count} digests", leaders.Count);
    }
}
