using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Drafts.Dtos;

public class DraftIssueDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssuePriority Priority { get; set; }
    public Guid CompanyId { get; set; }
    public Guid? StateId { get; set; }
    public string? StateName { get; set; }
    public Guid OwnedById { get; set; }
    public Guid? AssigneeId { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
