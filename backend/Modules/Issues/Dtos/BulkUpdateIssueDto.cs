using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Issues.Dtos;

public class BulkUpdateIssueDto
{
    public List<Guid> IssueIds { get; set; } = [];
    public Guid? StateId { get; set; }
    public IssuePriority? Priority { get; set; }
    public DateTime? DueDate { get; set; }
}
