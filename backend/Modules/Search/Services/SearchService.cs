using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;

namespace TaskManager.Api.Modules.Search.Services;

public class SearchService(AppDbContext db) : ISearchService
{
    private const int ResultLimit = 10;

    public async Task<SearchResults> SearchAsync(string workspaceSlug, string? query, Guid userId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
            return SearchResults.Empty;

        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var pattern = $"%{query.Trim()}%";

        var issues = await db.Issues
            .AsNoTracking()
            .Where(i => i.Company.WorkspaceId == workspace.Id && EF.Functions.ILike(i.Title, pattern))
            .OrderBy(i => i.Title)
            .Take(ResultLimit)
            .Select(i => new SearchHit(i.Id, i.Title, i.CompanyId, i.SequenceId, null))
            .ToListAsync(ct);

        var cycles = await db.Cycles
            .AsNoTracking()
            .Where(c => c.Company.WorkspaceId == workspace.Id && EF.Functions.ILike(c.Name, pattern))
            .OrderBy(c => c.Name)
            .Take(ResultLimit)
            .Select(c => new SearchHit(c.Id, c.Name, c.CompanyId, null, null))
            .ToListAsync(ct);

        var modules = await db.ProjectModules
            .AsNoTracking()
            .Where(m => m.Company.WorkspaceId == workspace.Id && EF.Functions.ILike(m.Name, pattern))
            .OrderBy(m => m.Name)
            .Take(ResultLimit)
            .Select(m => new SearchHit(m.Id, m.Name, m.CompanyId, null, null))
            .ToListAsync(ct);

        var views = await db.IssueViews
            .AsNoTracking()
            .Where(v => v.WorkspaceId == workspace.Id
                && (v.IsPublic || v.OwnerId == userId)
                && EF.Functions.ILike(v.Name, pattern))
            .OrderBy(v => v.Name)
            .Take(ResultLimit)
            .Select(v => new SearchHit(v.Id, v.Name, v.CompanyId, null, null))
            .ToListAsync(ct);

        var labels = await db.Labels
            .AsNoTracking()
            .Where(l => l.WorkspaceId == workspace.Id && EF.Functions.ILike(l.Name, pattern))
            .OrderBy(l => l.Name)
            .Take(ResultLimit)
            .Select(l => new SearchHit(l.Id, l.Name, null, null, l.Color))
            .ToListAsync(ct);

        return new SearchResults(issues, cycles, modules, views, labels);
    }
}
