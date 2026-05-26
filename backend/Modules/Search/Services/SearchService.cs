using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Common.Exceptions;
using TaskManager.Api.Data;

namespace TaskManager.Api.Modules.Search.Services;

public class SearchService(AppDbContext db) : ISearchService
{
    private const int ResultLimit = 10;
    private const int SnippetMaxLength = 160;

    public async Task<SearchResults> SearchAsync(string workspaceSlug, string? query, Guid userId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
            return SearchResults.Empty;

        var workspace = await db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Slug == workspaceSlug, ct)
            ?? throw new NotFoundException($"Workspace '{workspaceSlug}' not found.");

        var term = query.Trim();
        var pattern = $"%{term}%";

        var issues = await db.Issues
            .AsNoTracking()
            .Where(i => i.Project.WorkspaceId == workspace.Id && EF.Functions.ILike(i.Title, pattern))
            .OrderBy(i => i.Title)
            .Take(ResultLimit)
            .Select(i => new { i.Id, i.Title, i.ProjectId, i.SequenceId })
            .ToListAsync(ct);

        var issueHits = issues
            .Select(i => BuildHit(
                i.Id, i.Title, i.ProjectId, i.SequenceId, null,
                snippetSource: i.Title, term: term, type: "issue", relevance: 1.0))
            .ToList();

        var cycles = await db.Cycles
            .AsNoTracking()
            .Where(c => c.Project.WorkspaceId == workspace.Id && EF.Functions.ILike(c.Name, pattern))
            .OrderBy(c => c.Name)
            .Take(ResultLimit)
            .Select(c => new { c.Id, c.Name, c.ProjectId })
            .ToListAsync(ct);

        var cycleHits = cycles
            .Select(c => BuildHit(c.Id, c.Name, c.ProjectId, null, null,
                snippetSource: c.Name, term: term, type: "cycle", relevance: 0.9))
            .ToList();

        var modules = await db.Modules
            .AsNoTracking()
            .Where(m => m.Project.WorkspaceId == workspace.Id && EF.Functions.ILike(m.Name, pattern))
            .OrderBy(m => m.Name)
            .Take(ResultLimit)
            .Select(m => new { m.Id, m.Name, m.ProjectId })
            .ToListAsync(ct);

        var moduleHits = modules
            .Select(m => BuildHit(m.Id, m.Name, m.ProjectId, null, null,
                snippetSource: m.Name, term: term, type: "module", relevance: 0.9))
            .ToList();

        var views = await db.IssueViews
            .AsNoTracking()
            .Where(v => v.WorkspaceId == workspace.Id
                && (v.IsPublic || v.OwnerId == userId)
                && EF.Functions.ILike(v.Name, pattern))
            .OrderBy(v => v.Name)
            .Take(ResultLimit)
            .Select(v => new { v.Id, v.Name, v.ProjectId })
            .ToListAsync(ct);

        var viewHits = views
            .Select(v => BuildHit(v.Id, v.Name, v.ProjectId, null, null,
                snippetSource: v.Name, term: term, type: "view", relevance: 0.8))
            .ToList();

        var labels = await db.Labels
            .AsNoTracking()
            .Where(l => l.WorkspaceId == workspace.Id && EF.Functions.ILike(l.Name, pattern))
            .OrderBy(l => l.Name)
            .Take(ResultLimit)
            .Select(l => new { l.Id, l.Name, l.Color })
            .ToListAsync(ct);

        var labelHits = labels
            .Select(l => BuildHit(l.Id, l.Name, null, null, l.Color,
                snippetSource: l.Name, term: term, type: "label", relevance: 0.6))
            .ToList();

        var comments = await db.IssueComments
            .AsNoTracking()
            .Where(c => c.Issue.Project.WorkspaceId == workspace.Id && EF.Functions.ILike(c.Body, pattern))
            .OrderByDescending(c => c.CreatedAt)
            .Take(ResultLimit)
            .Select(c => new
            {
                c.Id,
                c.Body,
                c.IssueId,
                IssueTitle = c.Issue.Title,
                IssueSequenceId = c.Issue.SequenceId,
                ProjectId = c.Issue.ProjectId,
                ProjectIdentifier = c.Issue.Project.Identifier
            })
            .ToListAsync(ct);

        var commentHits = comments
            .Select(c =>
            {
                var parent = $"{c.ProjectIdentifier}-{c.IssueSequenceId}";
                var title = $"Comentario en {parent}";
                return BuildHit(
                    c.Id, title, c.ProjectId, null, null,
                    snippetSource: c.Body, term: term, type: "comment", relevance: 0.7,
                    parentTitle: parent, issueId: c.IssueId);
            })
            .ToList();

        var files = await db.FileAssets
            .AsNoTracking()
            .Where(f => f.WorkspaceId == workspace.Id && EF.Functions.ILike(f.FileName, pattern))
            .OrderByDescending(f => f.CreatedAt)
            .Take(ResultLimit)
            .Select(f => new
            {
                f.Id,
                f.FileName,
                f.ContentType,
                f.SizeBytes,
                f.EntityType,
                f.EntityId
            })
            .ToListAsync(ct);

        var fileHits = new List<SearchHit>(files.Count);
        foreach (var f in files)
        {
            string? parentTitle = null;
            Guid? issueId = null;

            if (string.Equals(f.EntityType, "issue", StringComparison.OrdinalIgnoreCase)
                && Guid.TryParse(f.EntityId, out var parsedIssueId))
            {
                issueId = parsedIssueId;
                var issueInfo = await db.Issues
                    .AsNoTracking()
                    .Where(i => i.Id == parsedIssueId)
                    .Select(i => new { i.SequenceId, ProjectIdentifier = i.Project.Identifier })
                    .FirstOrDefaultAsync(ct);
                if (issueInfo is not null)
                    parentTitle = $"{issueInfo.ProjectIdentifier}-{issueInfo.SequenceId}";
            }

            var sizeLabel = FormatBytes(f.SizeBytes);
            var typeLabel = string.IsNullOrWhiteSpace(f.ContentType) ? "FILE" : f.ContentType.ToUpperInvariant();
            var snippet = parentTitle is null
                ? $"{typeLabel} · {sizeLabel}"
                : $"{typeLabel} · {sizeLabel} · adjunto a {parentTitle}";

            fileHits.Add(BuildHit(
                f.Id, f.FileName, null, null, null,
                snippetSource: snippet, term: term, type: "file", relevance: 0.5,
                parentTitle: parentTitle, issueId: issueId));
        }

        // TODO: Pages module is intentionally not implemented in TaskManager (feature removed by business decision).
        // If the Pages domain is ever introduced, index Page entities here.
        var pageHits = new List<SearchHit>();

        return new SearchResults(
            issueHits, cycleHits, moduleHits, viewHits, labelHits,
            commentHits, fileHits, pageHits);
    }

    private static SearchHit BuildHit(
        Guid id,
        string name,
        Guid? projectId,
        int? sequenceId,
        string? color,
        string snippetSource,
        string term,
        string type,
        double relevance,
        string? parentTitle = null,
        Guid? issueId = null)
    {
        var (snippet, start, end) = BuildSnippet(snippetSource, term);
        return new SearchHit(
            id, name, projectId, sequenceId, color,
            Snippet: snippet,
            ParentTitle: parentTitle,
            IssueId: issueId,
            Relevance: relevance,
            HighlightStart: start,
            HighlightEnd: end,
            Type: type);
    }

    private static (string snippet, int? start, int? end) BuildSnippet(string source, string term)
    {
        if (string.IsNullOrEmpty(source))
            return (string.Empty, null, null);

        var cleaned = source.Replace("\r", " ").Replace("\n", " ").Trim();
        var matchIndex = cleaned.IndexOf(term, StringComparison.OrdinalIgnoreCase);

        if (matchIndex < 0)
        {
            var truncated = cleaned.Length <= SnippetMaxLength
                ? cleaned
                : cleaned[..SnippetMaxLength] + "...";
            return (truncated, null, null);
        }

        // Center the snippet around the match when possible.
        var contextRadius = Math.Max(0, (SnippetMaxLength - term.Length) / 2);
        var startWindow = Math.Max(0, matchIndex - contextRadius);
        var endWindow = Math.Min(cleaned.Length, startWindow + SnippetMaxLength);
        if (endWindow == cleaned.Length)
            startWindow = Math.Max(0, endWindow - SnippetMaxLength);

        var window = cleaned[startWindow..endWindow];
        var prefix = startWindow > 0 ? "..." : string.Empty;
        var suffix = endWindow < cleaned.Length ? "..." : string.Empty;

        var relativeStart = matchIndex - startWindow + prefix.Length;
        var relativeEnd = relativeStart + term.Length;

        var snippet = prefix + window + suffix;
        return (snippet, relativeStart, relativeEnd);
    }

    private static string FormatBytes(long bytes)
    {
        if (bytes < 1024) return $"{bytes} B";
        double kb = bytes / 1024d;
        if (kb < 1024) return $"{kb:0.#} KB";
        double mb = kb / 1024d;
        if (mb < 1024) return $"{mb:0.#} MB";
        double gb = mb / 1024d;
        return $"{gb:0.#} GB";
    }
}
