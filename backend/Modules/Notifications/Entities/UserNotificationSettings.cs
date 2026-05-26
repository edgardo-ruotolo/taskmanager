using TaskManager.Api.Common.Auditing;
using TaskManager.Api.Modules.Auth.Entities;

namespace TaskManager.Api.Modules.Notifications.Entities;

/// <summary>
/// Per-user global email-notification settings — one row per user.
/// Holds values that don't fit the (Type,Property,bool) row model
/// (unsubscribe token, global kill-switch, digest opt-in).
/// </summary>
public class UserNotificationSettings : AuditableEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    /// <summary>Master kill-switch — overrides every per-event flag.</summary>
    public bool EmailUnsubscribed { get; set; } = false;

    /// <summary>Opaque token used in the <c>List-Unsubscribe</c> header and the public endpoint.</summary>
    public string UnsubscribeToken { get; set; } = Guid.NewGuid().ToString("N");

    /// <summary>When true, non-critical personal events are queued into the daily digest instead of sent immediately.</summary>
    public bool EmailDailyDigest { get; set; } = false;
}
