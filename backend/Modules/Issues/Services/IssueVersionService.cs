using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;
using TaskManager.Api.Modules.Issues.Dtos;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Services;

public class IssueVersionService(AppDbContext db) : IIssueVersionService
{
    public async Task<List<IssueVersionDto>> GetVersionsAsync(string workspaceSlug, Guid companyId, Guid issueId, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId && i.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Issue not found.");

        return await db.IssueVersions
            .Include(v => v.OwnedBy)
            .Where(v => v.IssueId == issueId)
            .OrderByDescending(v => v.LastSavedAt)
            .Take(20)
            .Select(v => new IssueVersionDto
            {
                Id = v.Id,
                IssueId = v.IssueId,
                OwnedById = v.OwnedById,
                OwnedByName = v.OwnedBy.UserName ?? "",
                LastSavedAt = v.LastSavedAt,
                DescriptionJson = v.DescriptionJson
            })
            .ToListAsync(ct);
    }

    public async Task<IssueVersionDto> SaveVersionAsync(string workspaceSlug, Guid companyId, Guid issueId, Guid userId, CreateIssueVersionDto dto, CancellationToken ct = default)
    {
        var workspace = await db.Workspaces.FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        _ = await db.Issues.FirstOrDefaultAsync(i => i.Id == issueId && i.CompanyId == companyId && i.Company.WorkspaceId == workspace.Id, ct)
            ?? throw new NotFoundException("Issue not found.");

        var version = new IssueVersion
        {
            IssueId = issueId,
            OwnedById = userId,
            LastSavedAt = DateTime.UtcNow,
            DescriptionJson = dto.DescriptionJson
        };

        db.IssueVersions.Add(version);
        await db.SaveChangesAsync(ct);

        var user = await db.Users.FindAsync([userId], ct);

        return new IssueVersionDto
        {
            Id = version.Id,
            IssueId = version.IssueId,
            OwnedById = version.OwnedById,
            OwnedByName = user?.UserName ?? "",
            LastSavedAt = version.LastSavedAt,
            DescriptionJson = version.DescriptionJson
        };
    }
}
