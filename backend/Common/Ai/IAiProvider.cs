namespace TaskManager.Api.Common.Ai;

public interface IAiProvider
{
    Task<string> CompleteTextAsync(string prompt, CancellationToken ct = default);
    Task<List<string>> SuggestLabelsAsync(string issueTitle, string issueDescription, CancellationToken ct = default);
    Task<string> SummarizeActivityAsync(IEnumerable<string> activityItems, CancellationToken ct = default);
    Task<List<string>> GenerateSubIssuesAsync(string issueTitle, string issueDescription, int count = 5, CancellationToken ct = default);
    Task<string> ImproveTextAsync(string text, CancellationToken ct = default);
}
