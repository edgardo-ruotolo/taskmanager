namespace TaskManager.Api.Common.Ai;

public class StubAiProvider(ILogger<StubAiProvider> logger) : IAiProvider
{
    public Task<string> CompleteTextAsync(string prompt, CancellationToken ct = default)
    {
        logger.LogInformation("StubAiProvider.CompleteTextAsync called with prompt length {Length}", prompt.Length);
        var preview = prompt.Length > 50 ? prompt[..50] : prompt;
        return Task.FromResult($"[AI] Generated continuation for: {preview}...");
    }

    public Task<List<string>> SuggestLabelsAsync(string issueTitle, string issueDescription, CancellationToken ct = default)
    {
        logger.LogInformation("StubAiProvider.SuggestLabelsAsync called for issue title: {Title}", issueTitle);
        return Task.FromResult(new List<string> { "bug", "high-priority", "backend" });
    }

    public Task<string> SummarizeActivityAsync(IEnumerable<string> activityItems, CancellationToken ct = default)
    {
        var items = activityItems.ToList();
        logger.LogInformation("StubAiProvider.SummarizeActivityAsync called with {Count} items", items.Count);
        return Task.FromResult(
            $"[AI] Summary of {items.Count} activities: workflow in progress with recent changes in status and assignments.");
    }

    public Task<List<string>> GenerateSubIssuesAsync(string issueTitle, string issueDescription, int count = 5, CancellationToken ct = default)
    {
        logger.LogInformation("StubAiProvider.GenerateSubIssuesAsync called for {Title} with count {Count}", issueTitle, count);

        var subIssues = Enumerable.Range(1, count).Select(i => i switch
        {
            1 => $"Design {issueTitle} - part {i}",
            2 => $"Implement logic for {issueTitle}",
            3 => $"Write tests for {issueTitle}",
            4 => $"Review and validate {issueTitle}",
            _ => $"Follow-up task {i} for {issueTitle}"
        }).ToList();

        return Task.FromResult(subIssues);
    }

    public Task<string> ImproveTextAsync(string text, CancellationToken ct = default)
    {
        logger.LogInformation("StubAiProvider.ImproveTextAsync called with text length {Length}", text.Length);
        return Task.FromResult($"[AI] Improved text: {text}");
    }
}
