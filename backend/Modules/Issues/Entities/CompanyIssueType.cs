using TaskManager.Api.Modules.Companies.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class CompanyIssueType
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    public Guid IssueTypeId { get; set; }
    public IssueType IssueType { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
