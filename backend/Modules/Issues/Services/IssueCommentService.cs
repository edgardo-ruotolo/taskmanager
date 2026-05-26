using AutoMapper;
using Ganss.Xss;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Notifications;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.Realtime;
using TaskManager.Api.Modules.Realtime.Contracts;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueCommentService(
    AppDbContext db,
    IMapper mapper,
    IHtmlSanitizer htmlSanitizer,
    IRealtimePublisher realtime,
    INotificationDispatcher notifications,
    IConfiguration configuration) : IIssueCommentService
{
    private string FrontendBaseUrl => configuration["App:FrontendUrl"]?.TrimEnd('/') ?? "";

    public async Task<List<IssueCommentDto>> GetCommentsAsync(Guid issueId, CancellationToken ct = default)
    {
        var comments = await db.IssueComments
            .Include(c => c.Author)
            .Where(c => c.IssueId == issueId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(ct);

        return mapper.Map<List<IssueCommentDto>>(comments);
    }

    public async Task<IssueCommentDto> CreateCommentAsync(Guid issueId, Guid authorId, CreateCommentDto dto, CancellationToken ct = default)
    {
        var issue = await db.Issues.AsNoTracking()
            .Where(i => i.Id == issueId)
            .Select(i => new { i.Id, i.Title, i.ProjectId, i.CreatedById, i.AssigneeId })
            .FirstOrDefaultAsync(ct);

        var projectId = issue?.ProjectId ?? Guid.Empty;

        var comment = mapper.Map<IssueComment>(dto);
        comment.IssueId = issueId;
        comment.AuthorId = authorId;

        if (!string.IsNullOrEmpty(comment.Body))
            comment.Body = htmlSanitizer.Sanitize(comment.Body);

        db.IssueComments.Add(comment);
        await db.SaveChangesAsync(ct);

        await db.Entry(comment).Reference(c => c.Author).LoadAsync(ct);

        if (projectId != Guid.Empty)
        {
            var evt = new RealtimeEvent("comment.created", string.Empty, projectId, issueId, authorId, DateTimeOffset.UtcNow);
            await realtime.PublishToProjectAsync(projectId, evt, ct);
            await realtime.PublishToIssueAsync(issueId, evt, ct);
        }

        if (issue is not null)
            await EnqueueCommentNotificationsAsync(issue.Id, issue.Title, issue.ProjectId, issue.CreatedById, issue.AssigneeId, authorId, comment, ct);

        return mapper.Map<IssueCommentDto>(comment);
    }

    public async Task DeleteCommentAsync(Guid commentId, Guid requesterId, CancellationToken ct = default)
    {
        var comment = await db.IssueComments.FindAsync([commentId], ct)
            ?? throw new NotFoundException("Comment not found.");

        if (comment.AuthorId != requesterId)
            throw new ForbiddenException("You are not allowed to delete this comment.");

        var issueId = comment.IssueId;
        var projectId = await db.Issues.AsNoTracking()
            .Where(i => i.Id == issueId)
            .Select(i => i.ProjectId)
            .FirstOrDefaultAsync(ct);

        comment.IsDeleted = true;
        comment.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        if (projectId != Guid.Empty)
        {
            var evt = new RealtimeEvent("comment.deleted", string.Empty, projectId, issueId, requesterId, DateTimeOffset.UtcNow);
            await realtime.PublishToProjectAsync(projectId, evt, ct);
            await realtime.PublishToIssueAsync(issueId, evt, ct);
        }
    }

    private async Task EnqueueCommentNotificationsAsync(
        Guid issueId,
        string issueTitle,
        Guid projectId,
        Guid creatorId,
        Guid? primaryAssigneeId,
        Guid actorId,
        IssueComment comment,
        CancellationToken ct)
    {
        var watcherIds = new HashSet<Guid>();
        if (creatorId != actorId) watcherIds.Add(creatorId);
        if (primaryAssigneeId.HasValue && primaryAssigneeId.Value != actorId)
            watcherIds.Add(primaryAssigneeId.Value);

        var additional = await db.IssueAssignees.AsNoTracking()
            .Where(a => a.IssueId == issueId && a.UserId != actorId)
            .Select(a => a.UserId)
            .ToListAsync(ct);
        foreach (var id in additional) watcherIds.Add(id);

        var subscribers = await db.IssueSubscribers.AsNoTracking()
            .Where(s => s.IssueId == issueId && s.UserId != actorId)
            .Select(s => s.UserId)
            .ToListAsync(ct);
        foreach (var id in subscribers) watcherIds.Add(id);

        if (watcherIds.Count == 0) return;

        var users = await db.Users.AsNoTracking()
            .Where(u => watcherIds.Contains(u.Id) && u.Email != null)
            .ToListAsync(ct);
        var actor = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == actorId, ct);
        var commenterName = actor?.FirstName ?? actor?.UserName ?? string.Empty;

        var preview = StripHtmlPreview(comment.Body, 300);

        foreach (var u in users)
        {
            notifications.Enqueue(new EmailJobPayload
            {
                Kind = EmailJobKind.IssueComment,
                RecipientUserId = u.Id,
                RecipientEmail = u.Email!,
                RecipientName = u.FirstName ?? u.UserName ?? string.Empty,
                ActorUserId = actorId,
                EntityId = issueId,
                Params = new Dictionary<string, object?>
                {
                    ["firstName"] = u.FirstName ?? u.UserName,
                    ["commenterName"] = commenterName,
                    ["issueTitle"] = issueTitle,
                    ["commentPreview"] = preview,
                    ["issueUrl"] = $"{FrontendBaseUrl}/projects/{projectId}/issues/{issueId}"
                }
            });
        }
    }

    private static string StripHtmlPreview(string? body, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(body)) return string.Empty;
        var text = System.Text.RegularExpressions.Regex.Replace(body, "<[^>]+>", " ");
        text = System.Net.WebUtility.HtmlDecode(text);
        text = System.Text.RegularExpressions.Regex.Replace(text, "\\s+", " ").Trim();
        return text.Length > maxLength ? text[..maxLength] + "…" : text;
    }
}
