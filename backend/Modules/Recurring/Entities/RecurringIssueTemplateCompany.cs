using TaskManager.Api.Modules.Companies.Entities;

namespace TaskManager.Api.Modules.Recurring.Entities;

public class RecurringIssueTemplateCompany
{
    public Guid TemplateId { get; set; }
    public RecurringIssueTemplate Template { get; set; } = null!;
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
}
