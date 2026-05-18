using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Companies.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public enum IssuePriority { None = 0, Urgent = 1, High = 2, Medium = 3, Low = 4 }

public class Issue : AuditableEntity
{
    public int SequenceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssuePriority Priority { get; set; } = IssuePriority.None;
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    public Guid StateId { get; set; }
    public State State { get; set; } = null!;
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;
    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }
    public Guid? ParentId { get; set; }
    public Issue? Parent { get; set; }
    public ICollection<Issue> SubIssues { get; set; } = [];
    public DateTime? DueDate { get; set; }
    public bool IsArchived { get; set; } = false;
    public DateTime? ArchivedAt { get; set; }
    public Guid? IssueTypeId { get; set; }
    public IssueType? IssueType { get; set; }
    public ICollection<IssueAssignee> Assignees { get; set; } = [];
    public ICollection<IssueLabel> Labels { get; set; } = [];
    public ICollection<IssueComment> Comments { get; set; } = [];
    public ICollection<IssueReaction> Reactions { get; set; } = [];
    public ICollection<IssueActivity> Activities { get; set; } = [];
}
