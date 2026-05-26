using TaskManager.Api.Common.Auditing;

namespace TaskManager.Api.Modules.Notifications.Entities;

/// <summary>
/// Idempotency record for scheduled email jobs (overdue digest, daily digest, cycle midpoint).
/// Each (UserId, Kind, Bucket) is unique — Bucket is usually a date stamp.
/// </summary>
public class EmailSentLog : AuditableEntity
{
    public Guid UserId { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string Bucket { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
