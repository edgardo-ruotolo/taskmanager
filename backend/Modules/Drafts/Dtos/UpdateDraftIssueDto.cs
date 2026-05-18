using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Drafts.Dtos;

public class UpdateDraftIssueDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public IssuePriority? Priority { get; set; }
    public Guid? StateId { get; set; }
    public Guid? AssigneeId { get; set; }
    public DateTime? DueDate { get; set; }
}
