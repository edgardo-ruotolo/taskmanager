using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class ProjectIssueType
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid IssueTypeId { get; set; }
    public IssueType IssueType { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
