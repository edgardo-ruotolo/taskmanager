using TaskManager.Api.Modules.Projects.Entities;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Recurring.Entities;

public class RecurringIssueRunIssue
{
    public Guid RunId { get; set; }
    public RecurringIssueRun Run { get; set; } = null!;
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}
