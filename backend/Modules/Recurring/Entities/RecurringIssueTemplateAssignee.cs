using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Recurring.Entities;

public class RecurringIssueTemplateAssignee
{
    public Guid TemplateId { get; set; }
    public RecurringIssueTemplate Template { get; set; } = null!;
    public Guid AssigneeId { get; set; }
    public User Assignee { get; set; } = null!;
}
