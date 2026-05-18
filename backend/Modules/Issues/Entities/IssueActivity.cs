using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class IssueActivity : AuditableEntity
{
    public string Field { get; set; } = "";
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid ActorId { get; set; }
    public User Actor { get; set; } = null!;
}
