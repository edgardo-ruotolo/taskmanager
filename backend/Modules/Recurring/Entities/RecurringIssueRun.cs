using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Issues.Entities;
using TaskManager.Api.Modules.Workspaces.Entities;

namespace TaskManager.Api.Modules.Recurring.Entities;

public class RecurringIssueRun : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public Guid TemplateId { get; set; }
    public RecurringIssueTemplate Template { get; set; } = null!;
    public DateTime ScheduledFor { get; set; }
    public DateTime? ExecutedAt { get; set; }
    public RecurringRunStatus Status { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
    public ICollection<RecurringIssueRunIssue> GeneratedIssues { get; set; } = [];
    public ICollection<Issue> BlockedByIssues { get; set; } = [];
}
