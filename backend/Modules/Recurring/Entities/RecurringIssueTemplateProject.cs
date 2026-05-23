using TaskManager.Api.Modules.Projects.Entities;

namespace TaskManager.Api.Modules.Recurring.Entities;

public class RecurringIssueTemplateProject
{
    public Guid TemplateId { get; set; }
    public RecurringIssueTemplate Template { get; set; } = null!;
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}
