using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Dtos;

public class CreateIssueDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssuePriority Priority { get; set; } = IssuePriority.None;
    public Guid StateId { get; set; }
    public Guid? AssigneeId { get; set; }
    public Guid? ParentId { get; set; }
    public DateTime? DueDate { get; set; }
}
