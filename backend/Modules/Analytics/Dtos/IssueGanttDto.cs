using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Analytics.Dtos;

public class IssueGanttDto
{
    public Guid Id { get; set; }
    public int SequenceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ProjectIdentifier { get; set; } = string.Empty;
    public Guid? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssigneeAvatarUrl { get; set; }
    public List<Guid> LabelIds { get; set; } = new();
    public Guid StateId { get; set; }
    public string StateName { get; set; } = string.Empty;
    public string StateColor { get; set; } = string.Empty;
    public StateCategory StateCategory { get; set; }
    public IssuePriority Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool IsOverdue { get; set; }
}
