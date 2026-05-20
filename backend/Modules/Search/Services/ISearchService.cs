namespace TaskManager.Api.Modules.Search.Services;

public record SearchHit(Guid Id, string Name, Guid? CompanyId, int? SequenceId, string? Color);

public record SearchResults(
    IReadOnlyList<SearchHit> Issues,
    IReadOnlyList<SearchHit> Cycles,
    IReadOnlyList<SearchHit> Modules,
    IReadOnlyList<SearchHit> Views,
    IReadOnlyList<SearchHit> Labels)
{
    public static SearchResults Empty { get; } = new([], [], [], [], []);
}

public interface ISearchService
{
    Task<SearchResults> SearchAsync(string workspaceSlug, string? query, Guid userId, CancellationToken ct = default);
}
