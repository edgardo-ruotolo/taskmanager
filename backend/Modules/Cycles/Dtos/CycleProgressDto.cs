namespace TaskManager.Api.Modules.Cycles.Dtos;

public class CycleProgressDto
{
    public int TotalIssues { get; set; }
    public int CompletedIssues { get; set; }
    public int InProgressIssues { get; set; }
    public int PendingIssues { get; set; }
    public double CompletionPercentage { get; set; }
}
