namespace TaskManager.Api.Modules.Search.Services;

public record SearchHit(
    Guid Id,
    string Name,
    Guid? ProjectId,
    int? SequenceId,
    string? Color,
    string? Snippet = null,
    string? ParentTitle = null,
    Guid? IssueId = null,
    double? Relevance = null,
    int? HighlightStart = null,
    int? HighlightEnd = null,
    string? Type = null);

public record SearchResults(
    IReadOnlyList<SearchHit> Issues,
    IReadOnlyList<SearchHit> Cycles,
    IReadOnlyList<SearchHit> Modules,
    IReadOnlyList<SearchHit> Views,
    IReadOnlyList<SearchHit> Labels,
    IReadOnlyList<SearchHit> Comments,
    IReadOnlyList<SearchHit> Files,
    IReadOnlyList<SearchHit> Pages)
{
    public static SearchResults Empty { get; } = new([], [], [], [], [], [], [], []);
}

public interface ISearchService
{
    Task<SearchResults> SearchAsync(string workspaceSlug, string? query, Guid userId, CancellationToken ct = default);
}
