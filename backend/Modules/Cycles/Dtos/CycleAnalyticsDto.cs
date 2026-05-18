namespace TaskManager.Api.Modules.Cycles.Dtos;

public class CycleAnalyticsDto
{
    public int TotalIssues { get; set; }
    public int CompletedIssues { get; set; }
    public double CompletionPercentage { get; set; }
    public Dictionary<string, int> IssuesByPriority { get; set; } = [];
    public Dictionary<string, int> IssuesByState { get; set; } = [];
}
