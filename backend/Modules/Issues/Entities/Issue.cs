using System.Text.Json.Serialization;
using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Projects.Entities;
using TaskManager.Api.Modules.Cycles.Entities;
using TaskManager.Api.Modules.Modules.Entities;
using TaskManager.Api.Modules.States.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

[JsonConverter(typeof(JsonNumberEnumConverter<IssuePriority>))]
public enum IssuePriority { None = 0, Urgent = 1, High = 2, Medium = 3, Low = 4 }

public class Issue : AuditableEntity
{
    public int SequenceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DescriptionHtml { get; set; }
    public string? DescriptionJson { get; set; }
    public IssuePriority Priority { get; set; } = IssuePriority.None;
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid StateId { get; set; }
    public State State { get; set; } = null!;
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;
    public Guid? UpdatedById { get; set; }
    public User? UpdatedBy { get; set; }
    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }
    public Guid? ParentId { get; set; }
    public Issue? Parent { get; set; }
    public ICollection<Issue> SubIssues { get; set; } = [];
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public double SortOrder { get; set; } = 65535;
    public bool IsDraft { get; set; } = false;
    public bool IsArchived { get; set; } = false;
    public DateTime? ArchivedAt { get; set; }
    public Guid? IssueTypeId { get; set; }
    public IssueType? IssueType { get; set; }
    public string? ExternalSource { get; set; }
    public string? ExternalId { get; set; }
    public ICollection<IssueAssignee> Assignees { get; set; } = [];
    public ICollection<IssueLabel> Labels { get; set; } = [];
    public ICollection<IssueComment> Comments { get; set; } = [];
    public ICollection<IssueReaction> Reactions { get; set; } = [];
    public ICollection<IssueActivity> Activities { get; set; } = [];
    public ICollection<CycleIssue> CycleIssues { get; set; } = [];
    public ICollection<ModuleIssue> ModuleIssues { get; set; } = [];
    public bool RequiresAdminApproval { get; set; } = false;
    public List<Guid> ApprovalRequiredStateIds { get; set; } = new();
    public Guid? ApprovedById { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public User? ApprovedBy { get; set; }
}
