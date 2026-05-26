using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Notifications;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Notifications.Entities;

namespace TaskManager.Api.Modules.Notifications.Jobs;

/// <summary>
/// Daily Hangfire recurring job — for every user with <c>EmailDailyDigest=true</c>,
/// aggregates today's activity (new assignments, mentions, comments, due-soon issues)
/// into a single email. Idempotent per (UserId, bucket).
/// </summary>
public class DailyDigestJob(
    AppDbContext db,
    INotificationDispatcher notifications,
    IConfiguration configuration,
    ILogger<DailyDigestJob> logger)
{
    public const string RecurringJobId = "notifications-daily-digest";

    public async Task RunAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var since = now.AddHours(-24);
        var bucket = now.Date.ToString("yyyy-MM-dd");
        var frontendUrl = configuration["App:FrontendUrl"]?.TrimEnd('/') ?? "";

        var users = await db.UserNotificationSettings
            .Where(s => s.EmailDailyDigest && !s.EmailUnsubscribed)
            .Include(s => s.User)
            .AsNoTracking()
            .ToListAsync(ct);

        var dispatched = 0;
        foreach (var settings in users)
        {
            if (string.IsNullOrWhiteSpace(settings.User.Email)) continue;

            var sent = await db.EmailSentLogs.AnyAsync(l =>
                l.UserId == settings.UserId
                && l.Kind == nameof(EmailJobKind.DailyDigest)
                && l.Bucket == bucket, ct);
            if (sent) continue;

            var assigned = await db.IssueAssignees
                .Where(a => a.UserId == settings.UserId && a.Issue.UpdatedAt >= since)
                .Include(a => a.Issue)
                .AsNoTracking()
                .Select(a => new
                {
                    a.Issue.Id,
                    a.Issue.SequenceId,
                    a.Issue.Title,
                    a.Issue.ProjectId
                })
                .ToListAsync(ct);

            var mentions = await db.IssueMentions
                .Where(m => m.MentionedUserId == settings.UserId && m.CreatedAt >= since)
                .Include(m => m.Issue)
                .AsNoTracking()
                .Select(m => new { m.Issue.Id, m.Issue.SequenceId, m.Issue.Title, m.Issue.ProjectId })
                .ToListAsync(ct);

            var soon = now.AddDays(3);
            var dueSoon = await db.IssueAssignees
                .Where(a => a.UserId == settings.UserId
                    && a.Issue.DueDate != null
                    && a.Issue.DueDate > now && a.Issue.DueDate < soon
                    && a.Issue.CompletedAt == null)
                .Include(a => a.Issue)
                .AsNoTracking()
                .Select(a => new
                {
                    a.Issue.Id,
                    a.Issue.SequenceId,
                    a.Issue.Title,
                    a.Issue.ProjectId,
                    a.Issue.DueDate
                })
                .ToListAsync(ct);

            if (assigned.Count == 0 && mentions.Count == 0 && dueSoon.Count == 0) continue;

            notifications.Enqueue(new EmailJobPayload
            {
                Kind = EmailJobKind.DailyDigest,
                RecipientUserId = settings.UserId,
                RecipientEmail = settings.User.Email!,
                RecipientName = settings.User.FirstName ?? settings.User.UserName ?? string.Empty,
                Params = new Dictionary<string, object?>
                {
                    ["firstName"] = settings.User.FirstName ?? settings.User.UserName,
                    ["assignedCount"] = assigned.Count,
                    ["mentionsCount"] = mentions.Count,
                    ["dueSoonCount"] = dueSoon.Count,
                    ["assigned"] = assigned.Select(i => new
                    {
                        sequenceId = i.SequenceId,
                        title = i.Title,
                        issueUrl = $"{frontendUrl}/projects/{i.ProjectId}/issues/{i.Id}"
                    }).ToList(),
                    ["mentions"] = mentions.Select(i => new
                    {
                        sequenceId = i.SequenceId,
                        title = i.Title,
                        issueUrl = $"{frontendUrl}/projects/{i.ProjectId}/issues/{i.Id}"
                    }).ToList(),
                    ["dueSoon"] = dueSoon.Select(i => new
                    {
                        sequenceId = i.SequenceId,
                        title = i.Title,
                        dueDate = i.DueDate?.ToString("yyyy-MM-dd"),
                        issueUrl = $"{frontendUrl}/projects/{i.ProjectId}/issues/{i.Id}"
                    }).ToList()
                }
            });

            db.EmailSentLogs.Add(new EmailSentLog
            {
                UserId = settings.UserId,
                Kind = nameof(EmailJobKind.DailyDigest),
                Bucket = bucket
            });
            dispatched++;
        }

        if (dispatched > 0)
        {
            await db.SaveChangesAsync(ct);
            logger.LogInformation("DailyDigestJob: dispatched {Count} digests", dispatched);
        }
    }
}
