namespace TaskManager.Api.Modules.Analytics.Dtos;

public class UserRankingDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public int Assigned { get; set; }
    public int Completed { get; set; }
    public int InProgress { get; set; }
    public int Overdue { get; set; }
    public double AvgResolutionDays { get; set; }
    public double ThroughputPerWeek { get; set; }
}
