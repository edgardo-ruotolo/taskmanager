namespace TaskManager.Api.Modules.Analytics.Dtos;

public class ClientComparisonDto
{
    public Guid LabelId { get; set; }
    public string LabelName { get; set; } = string.Empty;
    public string LabelColor { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Open { get; set; }
    public int Completed { get; set; }
    public int Overdue { get; set; }
    public double PercentComplete { get; set; }
    public double AvgResolutionDays { get; set; }
}
