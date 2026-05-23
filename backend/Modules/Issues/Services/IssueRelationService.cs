using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueRelationService(AppDbContext db) : IIssueRelationService
{
    public async Task<List<IssueRelationDto>> GetRelationsAsync(string workspaceSlug, Guid projectId, Guid issueId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId && i.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Issue not found.");

        return await db.IssueRelations
            .Include(r => r.RelatedIssue)
            .Where(r => r.IssueId == issueId)
            .Select(r => new IssueRelationDto
            {
                Id = r.Id,
                IssueId = r.IssueId,
                RelatedIssueId = r.RelatedIssueId,
                RelatedIssueTitle = r.RelatedIssue.Title,
                RelatedIssueSequenceId = r.RelatedIssue.SequenceId,
                RelationType = r.RelationType,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<IssueRelationDto> CreateRelationAsync(string workspaceSlug, Guid projectId, Guid issueId, CreateIssueRelationDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.ProjectId == projectId && i.Project.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Issue not found.");

        var relatedIssue = await db.Issues.FindAsync([dto.RelatedIssueId], ct)
            ?? throw new NotFoundException("Related issue not found.");

        var relation = new IssueRelation
        {
            IssueId = issueId,
            RelatedIssueId = dto.RelatedIssueId,
            RelationType = dto.RelationType
        };

        db.IssueRelations.Add(relation);
        await db.SaveChangesAsync(ct);

        return new IssueRelationDto
        {
            Id = relation.Id,
            IssueId = relation.IssueId,
            RelatedIssueId = relation.RelatedIssueId,
            RelatedIssueTitle = relatedIssue.Title,
            RelatedIssueSequenceId = relatedIssue.SequenceId,
            RelationType = relation.RelationType,
            CreatedAt = relation.CreatedAt
        };
    }

    public async Task DeleteRelationAsync(string workspaceSlug, Guid projectId, Guid issueId, Guid relationId, CancellationToken ct = default)
    {
        var relation = await db.IssueRelations
            .FirstOrDefaultAsync(r => r.Id == relationId && r.IssueId == issueId, ct)
            ?? throw new NotFoundException("Relation not found.");

        db.IssueRelations.Remove(relation);
        await db.SaveChangesAsync(ct);
    }
}
