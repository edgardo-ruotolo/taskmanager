using TaskManager.Api.Modules.Notifications.Constants;

namespace TaskManager.Api.Common.Notifications;

/// <summary>
/// Logical kinds of email the system can send. Each maps to a Brevo template id
/// (<c>Brevo:Templates:&lt;Kind&gt;</c>) and may be gated by a (Type,Property) pair in
/// <c>UserNotificationPreference</c>.
/// </summary>
public enum EmailJobKind
{
    Welcome,
    PasswordReset,
    MagicLink,
    ProjectInvitation,
    IssueAssigned,
    IssueMention,
    IssueComment,
    IssueStateChanged,
    IssueDueSoon,
    CycleStart,
    CycleEnd,
    LeaderOverdueDigest,
    LeaderCycleMidpoint,
    LeaderApprovalPending,
    DailyDigest
}

/// <summary>
/// Self-contained payload pushed onto Hangfire for asynchronous delivery.
/// Carries everything the worker needs without touching scoped services again.
/// </summary>
public class EmailJobPayload
{
    public EmailJobKind Kind { get; set; }
    public Guid RecipientUserId { get; set; }
    public string RecipientEmail { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public Guid? ActorUserId { get; set; }
    public Guid? EntityId { get; set; }
    public Dictionary<string, object?> Params { get; set; } = new();

    /// <summary>Optional override; when null the dispatcher resolves it from <see cref="EmailJobKindGate"/>.</summary>
    public string? PreferenceType { get; set; }
    public string? PreferenceProperty { get; set; }
}

/// <summary>
/// Maps each <see cref="EmailJobKind"/> to the per-user preference pair that gates it.
/// Kinds with <c>null</c> here are always delivered (security-relevant transactional emails:
/// welcome, password reset, magic link, project invitation, leader-* opt-outs are checked
/// against the leader-specific properties).
/// </summary>
public static class EmailJobKindGate
{
    public static (string Type, string Property)? Gate(EmailJobKind kind) => kind switch
    {
        EmailJobKind.IssueAssigned => (NotificationEventTypes.TypeIssue, NotificationEventTypes.PropAssigned),
        EmailJobKind.IssueMention => (NotificationEventTypes.TypeIssue, NotificationEventTypes.PropMention),
        EmailJobKind.IssueComment => (NotificationEventTypes.TypeComment, NotificationEventTypes.PropCreated),
        EmailJobKind.IssueStateChanged => (NotificationEventTypes.TypeIssue, NotificationEventTypes.PropStateChanged),
        EmailJobKind.IssueDueSoon => (NotificationEventTypes.TypeIssue, NotificationEventTypes.PropDueSoon),
        EmailJobKind.CycleStart => (NotificationEventTypes.TypeCycle, NotificationEventTypes.PropStart),
        EmailJobKind.CycleEnd => (NotificationEventTypes.TypeCycle, NotificationEventTypes.PropEnd),
        EmailJobKind.LeaderOverdueDigest => (NotificationEventTypes.TypeLeader, NotificationEventTypes.PropOverdue),
        EmailJobKind.LeaderCycleMidpoint => (NotificationEventTypes.TypeLeader, NotificationEventTypes.PropMidpoint),
        EmailJobKind.LeaderApprovalPending => (NotificationEventTypes.TypeLeader, NotificationEventTypes.PropApprovalPending),
        EmailJobKind.DailyDigest => (NotificationEventTypes.TypeDigest, NotificationEventTypes.PropDaily),
        _ => null
    };
}
