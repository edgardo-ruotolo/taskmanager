using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Drafts.Dtos;

public class CreateDraftIssueDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssuePriority Priority { get; set; } = IssuePriority.None;
    public Guid CompanyId { get; set; }
    public Guid? StateId { get; set; }
    public Guid? AssigneeId { get; set; }
    public DateTime? DueDate { get; set; }
}
