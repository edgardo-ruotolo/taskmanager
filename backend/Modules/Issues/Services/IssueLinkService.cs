using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueLinkService(AppDbContext db) : IIssueLinkService
{
    public async Task<List<IssueLinkDto>> GetLinksAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId && i.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Issue not found.");

        return await db.IssueLinks
            .Where(l => l.IssueId == issueId)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new IssueLinkDto
            {
                Id = l.Id,
                Url = l.Url,
                Title = l.Title,
                IssueId = l.IssueId,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<IssueLinkDto> CreateLinkAsync(string workspaceSlug, Guid projectId, Guid issueId, CreateIssueLinkDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId && i.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Issue not found.");

        var link = new IssueLink
        {
            Url = dto.Url,
            Title = dto.Title,
            IssueId = issueId
        };

        db.IssueLinks.Add(link);
        await db.SaveChangesAsync(ct);

        return new IssueLinkDto
        {
            Id = link.Id,
            Url = link.Url,
            Title = link.Title,
            IssueId = link.IssueId,
            CreatedAt = link.CreatedAt
        };
    }

    public async Task DeleteLinkAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid linkId, CancellationToken ct = default)
    {
        var link = await db.IssueLinks
            .FirstOrDefaultAsync(l => l.Id == linkId && l.IssueId == issueId, ct)
            ?? throw new NotFoundException("Link not found.");

        link.IsDeleted = true;
        link.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }
}
