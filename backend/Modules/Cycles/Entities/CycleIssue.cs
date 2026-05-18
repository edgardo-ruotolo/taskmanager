using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.Cycles.Entities;

public class CycleIssue : AuditableEntity
{
    public Guid CycleId { get; set; }
    public Cycle Cycle { get; set; } = null!;
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid AddedById { get; set; }
}
