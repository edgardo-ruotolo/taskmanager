using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Modules.Entities;

public class ModuleIssue : AuditableEntity
{
    public Guid ModuleId { get; set; }
    public Module Module { get; set; } = null!;
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid AddedById { get; set; }
}
