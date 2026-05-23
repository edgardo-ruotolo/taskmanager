using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Modules.Intake.Entities;

public enum IntakeStatus { Pending = 0, Accepted = 1, Declined = 2, Duplicate = 3, Snoozed = 4 }

public class IntakeIssue : AuditableEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IntakeStatus Status { get; set; } = IntakeStatus.Pending;
    public string? Source { get; set; }
    public string? SubmitterEmail { get; set; }
    public string? DeclineReason { get; set; }
    public DateTime? SnoozedUntil { get; set; }
    public Guid? AcceptedAsIssueId { get; set; }
    public Guid? DuplicateOfIssueId { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
