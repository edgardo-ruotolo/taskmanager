using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Analytics.Dtos;

public class IssueRowDto
{
    public Guid Id { get; set; }
    public int SequenceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ProjectIdentifier { get; set; } = string.Empty;
    public Guid? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssigneeAvatarUrl { get; set; }
    public List<string> LabelNames { get; set; } = new();
    public List<Guid> LabelIds { get; set; } = new();
    public Guid StateId { get; set; }
    public string StateName { get; set; } = string.Empty;
    public string StateColor { get; set; } = string.Empty;
    public IssuePriority Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public double DaysInProgress { get; set; }
}
