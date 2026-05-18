using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Issues.Entities;

public class IssueReaction : AuditableEntity
{
    public string Emoji { get; set; } = "";
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid ActorId { get; set; }
    public User Actor { get; set; } = null!;
}
