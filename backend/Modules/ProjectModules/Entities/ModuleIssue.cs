using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.ProjectModules.Entities;

public class ModuleIssue : AuditableEntity
{
    public Guid ModuleId { get; set; }
    public ProjectModule Module { get; set; } = null!;
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid AddedById { get; set; }
}
