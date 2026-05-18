using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;
using TaskManager.Api.Modules.Issues.Entities;

namespace TaskManager.Api.Modules.TimeTracking.Entities;

public class IssueWorklog : AuditableEntity
{
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }

    /// <summary>Duration in minutes — can be provided manually or calculated from StartedAt/EndedAt.</summary>
    public int? DurationMinutes { get; set; }

    public string? Description { get; set; }
}
