namespace TaskManager.Api.Modules.TimeTracking.Dtos;

public class CreateWorklogDto
{
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Description { get; set; }
}

public class UpdateWorklogDto
{
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Description { get; set; }
}

public class WorklogSummaryDto
{
    public int TotalMinutes { get; set; }
    public double TotalHours { get; set; }
    public List<WorklogByUserDto> ByUser { get; set; } = [];
}

public class WorklogByUserDto
{
    public Guid UserId { get; set; }
    public string? UserDisplayName { get; set; }
    public string? UserEmail { get; set; }
    public int TotalMinutes { get; set; }
}
