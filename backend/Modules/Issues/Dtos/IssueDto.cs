using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueDto
{
    public Guid Id { get; set; }
    public int SequenceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssuePriority Priority { get; set; }
    public Guid CompanyId { get; set; }
    public Guid StateId { get; set; }
    public string StateName { get; set; } = string.Empty;
    public string StateColor { get; set; } = string.Empty;
    public string? StateGroup { get; set; }
    public Guid CreatedById { get; set; }
    public Guid? AssigneeId { get; set; }
    public List<Guid> AssigneeIds { get; set; } = [];
    public List<Guid> LabelIds { get; set; } = [];
    public Guid? ParentId { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsArchived { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
