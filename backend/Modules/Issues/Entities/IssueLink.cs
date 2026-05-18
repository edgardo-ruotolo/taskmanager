using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.Issues.Entities;

public class IssueLink : AuditableEntity
{
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
}
