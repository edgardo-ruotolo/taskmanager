using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Dtos;

public class IssueRelationDto
{
    public Guid Id { get; set; }
    public Guid IssueId { get; set; }
    public Guid RelatedIssueId { get; set; }
    public string RelatedIssueTitle { get; set; } = string.Empty;
    public int RelatedIssueSequenceId { get; set; }
    public IssueRelationType RelationType { get; set; }
    public DateTime CreatedAt { get; set; }
}
