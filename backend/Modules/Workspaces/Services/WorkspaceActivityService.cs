using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Common.Pagination;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Workspaces.Dtos;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Workspaces.Services;

public class WorkspaceActivityService(AppDbContext db) : IWorkspaceActivityService
{
    public async Task<PagedResult<WorkspaceActivityDto>> GetAllAsync(string workspaceSlug, int page, int pageSize, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.AsNoTracking()
            .FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var query = db.WorkspaceActivities
            .AsNoTracking()
            .Include(a => a.Actor)
            .Where(a => a.WorkspaceId == workspace.Id)
            .OrderByDescending(a => a.CreatedAt);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = items.Select(a => new WorkspaceActivityDto(
            a.Id,
            a.WorkspaceId,
            a.ActorId,
            (a.Actor.DisplayName ?? $"{a.Actor.FirstName} {a.Actor.LastName}".Trim()).Trim(),
            a.Action,
            DeriveEntityType(a.EntityType, a.Action),
            a.EntityId,
            a.EntityTitle,
            a.OldValue,
            a.NewValue,
            TruncateComment(a.CommentBody),
            a.CreatedAt
        )).ToList();

        return new PagedResult<WorkspaceActivityDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task LogAsync(Guid workspaceId, Guid actorId, string action, string? entityType, Guid? entityId, string? entityTitle, string? commentBody = null, CancellationToken ct = default)
    {
        var activity = new WorkspaceActivity
        {
            WorkspaceId = workspaceId,
            ActorId = actorId,
            Action = action,
            EntityType = DeriveEntityType(entityType, action),
            EntityId = entityId,
            EntityTitle = entityTitle,
            CommentBody = TruncateComment(commentBody)
        };

        db.WorkspaceActivities.Add(activity);
        await db.SaveChangesAsync(ct);
    }

    private static string? DeriveEntityType(string? explicitType, string action)
    {
        if (!string.IsNullOrWhiteSpace(explicitType)) return explicitType;
        if (string.IsNullOrWhiteSpace(action)) return null;

        var lower = action.ToLowerInvariant();
        if (lower.Contains("comment")) return "comment";
        if (lower.Contains("issue")) return "issue";
        if (lower.Contains("page")) return "page";
        if (lower.Contains("cycle")) return "cycle";
        if (lower.Contains("module")) return "module";
        if (lower.Contains("member")) return "member";
        if (lower.Contains("setting")) return "settings";
        return null;
    }

    private static string? TruncateComment(string? body)
    {
        if (string.IsNullOrEmpty(body)) return body;
        return body.Length <= 200 ? body : body[..200];
    }
}
