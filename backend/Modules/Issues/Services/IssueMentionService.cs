using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueMentionService(AppDbContext db) : IIssueMentionService
{
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
    }
}
