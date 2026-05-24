using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.Realtime;
using TaskManager.Api.Modules.Realtime.Contracts;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueSubscriberService(AppDbContext db, IRealtimePublisher realtime) : IIssueSubscriberService
{
    private async Task EmitSubscriberChangedAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid actorId, CancellationToken ct)
    {
        var evt = new RealtimeEvent("subscriber.changed", workspaceSlug, projectId, issueId, actorId, DateTimeOffset.UtcNow);
        await realtime.PublishToProjectAsync(projectId, evt, ct);
        await realtime.PublishToIssueAsync(issueId, evt, ct);
    }

    public async Task<List<IssueSubscriberDto>> GetSubscribersAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId && i.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Issue not found.");

        return await db.IssueSubscribers
            .Include(s => s.User)
            .Where(s => s.IssueId == issueId)
            .Select(s => new IssueSubscriberDto
            {
                UserId = s.UserId,
                Username = s.User.UserName ?? "",
                CreatedAt = s.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task SubscribeAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid userId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId && i.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Issue not found.");

        var exists = await db.IssueSubscribers.AnyAsync(s => s.IssueId == issueId && s.UserId == userId, ct);
        if (exists) return;

        db.IssueSubscribers.Add(new IssueSubscriber { IssueId = issueId, UserId = userId });
        await db.SaveChangesAsync(ct);

        await EmitSubscriberChangedAsync(workspaceSlug, projectId, issueId, userId, ct);
    }

    public async Task UnsubscribeAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid userId, CancellationToken ct = default)
    {
        var subscriber = await db.IssueSubscribers
            .FirstOrDefaultAsync(s => s.IssueId == issueId && s.UserId == userId, ct);

        if (subscriber is null) return;

        db.IssueSubscribers.Remove(subscriber);
        await db.SaveChangesAsync(ct);

        await EmitSubscriberChangedAsync(workspaceSlug, projectId, issueId, userId, ct);
    }
}
