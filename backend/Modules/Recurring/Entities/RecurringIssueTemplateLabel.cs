using TaskManager.Api.Modules.Labels.Entities;

namespace TaskManager.Api.Modules.Recurring.Entities;

public class RecurringIssueTemplateLabel
{
    public Guid TemplateId { get; set; }
    public RecurringIssueTemplate Template { get; set; } = null!;
    public Guid LabelId { get; set; }
    public Label Label { get; set; } = null!;
}
