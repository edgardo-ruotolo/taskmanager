namespace TaskManager.Api.Modules.Issues.Entities;

public enum IssueRelationType { DuplicateOf, BlockedBy, Blocking, IsEpicOf }

public class IssueRelation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid RelatedIssueId { get; set; }
    public Issue RelatedIssue { get; set; } = null!;
    public IssueRelationType RelationType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
