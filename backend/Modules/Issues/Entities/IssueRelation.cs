namespace TaskManager.Api.Modules.Issues.Entities;

public enum IssueRelationType
{
    DuplicateOf   = 0,
    BlockedBy     = 1,
    Blocking      = 2,
    IsEpicOf      = 3,
    Duplicate     = 4,
    RelatesTo     = 5,
    StartBefore   = 6,
    StartAfter    = 7,
    FinishBefore  = 8,
    FinishAfter   = 9,
    ImplementedBy = 10,
    Implements    = 11
}

public class IssueRelation
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid RelatedIssueId { get; set; }
    public Issue RelatedIssue { get; set; } = null!;
    public IssueRelationType RelationType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
