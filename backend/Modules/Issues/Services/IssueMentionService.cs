using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Notifications;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueMentionService(
    AppDbContext db,
    INotificationDispatcher notifications,
    IConfiguration configuration) : IIssueMentionService
{
    private string FrontendBaseUrl => configuration["App:FrontendUrl"]?.TrimEnd('/') ?? "";

    public async Task<List<IssueMentionDto>> GetMentionsAsync(Guid issueId, CancellationToken ct = default)
    {
        return await db.IssueMentions
            .Where(m => m.IssueId == issueId)
            .Select(m => new IssueMentionDto
            {
                IssueId = m.IssueId,
                MentionedUserId = m.MentionedUserId,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task SyncMentionsAsync(Guid issueId, List<Guid> mentionedUserIds, CancellationToken ct = default)
    {
        var incoming = mentionedUserIds.Distinct().ToHashSet();
        var existing = await db.IssueMentions.Where(m => m.IssueId == issueId).ToListAsync(ct);

        var toRemove = existing.Where(m => !incoming.Contains(m.MentionedUserId)).ToList();
        var toAdd = incoming.Where(uid => !existing.Any(m => m.MentionedUserId == uid)).ToList();

        db.IssueMentions.RemoveRange(toRemove);
        db.IssueMentions.AddRange(toAdd.Select(uid => new IssueMention
        {
            IssueId = issueId,
            MentionedUserId = uid
        }));

        await db.SaveChangesAsync(ct);

        if (toAdd.Count > 0)
            await EnqueueMentionsAsync(issueId, toAdd, ct);
    }

    private async Task EnqueueMentionsAsync(Guid issueId, List<Guid> mentionedUserIds, CancellationToken ct)
    {
        var issue = await db.Issues.AsNoTracking()
            .Where(i => i.Id == issueId)
            .Select(i => new { i.Id, i.Title, i.ProjectId, i.CreatedById })
            .FirstOrDefaultAsync(ct);
        if (issue is null) return;

        var users = await db.Users.AsNoTracking()
            .Where(u => mentionedUserIds.Contains(u.Id) && u.Email != null && u.Id != issue.CreatedById)
            .ToListAsync(ct);
        if (users.Count == 0) return;

        var mentioner = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == issue.CreatedById, ct);
        var mentionerName = mentioner?.FirstName ?? mentioner?.UserName ?? string.Empty;

        foreach (var u in users)
        {
            notifications.Enqueue(new EmailJobPayload
            {
                Kind = EmailJobKind.IssueMention,
                RecipientUserId = u.Id,
                RecipientEmail = u.Email!,
                RecipientName = u.FirstName ?? u.UserName ?? string.Empty,
                ActorUserId = issue.CreatedById,
                EntityId = issue.Id,
                Params = new Dictionary<string, object?>
                {
                    ["firstName"] = u.FirstName ?? u.UserName,
                    ["mentionerName"] = mentionerName,
                    ["issueTitle"] = issue.Title,
                    ["issueUrl"] = $"{FrontendBaseUrl}/projects/{issue.ProjectId}/issues/{issue.Id}"
                }
            });
        }
    }
}
