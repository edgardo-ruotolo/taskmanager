using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;

namespace TaskManager.Api.Common.Authorization;

public class DocumentAccessChecker(AppDbContext db) : IDocumentAccessChecker
{
    public async Task<bool> HasAccessAsync(string documentId, Guid userId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(documentId)) return false;

        var separatorIndex = documentId.IndexOf('-');
        if (separatorIndex <= 0 || separatorIndex >= documentId.Length - 1) return false;

        var kind = documentId[..separatorIndex];
        var reference = documentId[(separatorIndex + 1)..];

        return kind switch
        {
            "issue" => await HasIssueAccessAsync(reference, userId, ct),
            "company" => await HasCompanyAccessAsync(reference, userId, ct),
            "workspace" => await HasWorkspaceAccessAsync(reference, userId, ct),
            _ => false
        };
    }

    private async Task<bool> HasIssueAccessAsync(string reference, Guid userId, CancellationToken ct)
    {
        if (!Guid.TryParse(reference, out var issueId)) return false;

        return await db.Issues
            .Where(i => i.Id == issueId)
            .AnyAsync(i => db.CompanyMembers
                .Any(m => m.CompanyId == i.CompanyId && m.UserId == userId), ct);
    }

    private async Task<bool> HasCompanyAccessAsync(string reference, Guid userId, CancellationToken ct)
    {
        if (!Guid.TryParse(reference, out var companyId)) return false;

        return await db.CompanyMembers
            .AnyAsync(m => m.CompanyId == companyId && m.UserId == userId, ct);
    }

    private async Task<bool> HasWorkspaceAccessAsync(string reference, Guid userId, CancellationToken ct)
    {
        return await db.WorkspaceMembers
            .AnyAsync(m => m.Workspace.Slug == reference && m.UserId == userId && m.IsActive, ct);
    }
}
