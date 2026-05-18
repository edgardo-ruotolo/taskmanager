using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Dtos;

public class CreateIssueRelationDto
{
    public Guid RelatedIssueId { get; set; }
    public IssueRelationType RelationType { get; set; }
}
